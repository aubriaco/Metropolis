BEGIN;
ALTER TABLE payment ADD COLUMN IF NOT EXISTS checkoutfingerprint text;
CREATE UNIQUE INDEX IF NOT EXISTS payment_marketplace_checkout_key
    ON payment (userid, transactionid)
    WHERE itemtype = 'Order' AND NOT rejected AND transactionid LIKE 'marketplace-order:%';
CREATE INDEX IF NOT EXISTS refaccountinfo_utilitybillfileid
    ON refaccountinfo (utilitybillfileid) WHERE utilitybillfileid > 0;
COMMIT;
