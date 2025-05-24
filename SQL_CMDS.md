-- 1. Wallets
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- e.g., 'cash', 'bank', 'investment'
    metadata JSONB DEFAULT '{}'
);

-- 2. Wallet Balances
CREATE TABLE wallet_balances (
    wallet_id UUID PRIMARY KEY REFERENCES wallets(id) ON DELETE CASCADE,
    balance NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Transaction Categories
CREATE TABLE transaction_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    type TEXT CHECK (type IN ('in', 'out')) NOT NULL,
    description TEXT
);

-- 4. Transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    amount NUMERIC(14, 2) NOT NULL,
    type TEXT CHECK (type IN ('in', 'out')) NOT NULL,
    category_id UUID REFERENCES transaction_categories(id),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Financial Notes (for AI context)
CREATE TABLE financial_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note TEXT NOT NULL,
    context JSONB DEFAULT '{}', -- optional metadata or tagging
    related_wallet_id UUID REFERENCES wallets(id),
    related_category_id UUID REFERENCES transaction_categories(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Trigger Function: Update Wallet Balance
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        UPDATE wallet_balances
        SET balance = balance - (CASE WHEN OLD.type = 'in' THEN OLD.amount ELSE -OLD.amount END),
            updated_at = NOW()
        WHERE wallet_id = OLD.wallet_id;

    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO wallet_balances(wallet_id, balance)
        VALUES (NEW.wallet_id, CASE WHEN NEW.type = 'in' THEN NEW.amount ELSE -NEW.amount END)
        ON CONFLICT (wallet_id) DO UPDATE
        SET balance = wallet_balances.balance + 
                      (CASE WHEN NEW.type = 'in' THEN NEW.amount ELSE -NEW.amount END),
            updated_at = NOW();

    ELSIF TG_OP = 'UPDATE' THEN
        -- Subtract old value
        UPDATE wallet_balances
        SET balance = balance - (CASE WHEN OLD.type = 'in' THEN OLD.amount ELSE -OLD.amount END)
        WHERE wallet_id = OLD.wallet_id;

        -- Add new value
        UPDATE wallet_balances
        SET balance = balance + (CASE WHEN NEW.type = 'in' THEN NEW.amount ELSE -NEW.amount END),
            updated_at = NOW()
        WHERE wallet_id = NEW.wallet_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger Hook
CREATE TRIGGER trg_update_wallet_balance
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_wallet_balance();
