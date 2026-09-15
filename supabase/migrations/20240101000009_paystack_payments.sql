-- ============================================================================
-- PAYSTACK PAYMENTS
-- Tracks an in-flight Paystack payment intent and credits the wallet exactly
-- once per reference (idempotent), so verify + webhook can't double-credit.
-- ============================================================================

CREATE TABLE point_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  package_id TEXT NOT NULL REFERENCES point_packages(id),
  reference TEXT NOT NULL UNIQUE, -- Paystack transaction reference
  amount_kobo INT NOT NULL, -- amount charged (kobo / smallest unit)
  currency TEXT NOT NULL DEFAULT 'NGN',
  points INT NOT NULL DEFAULT 0,
  bonus INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE point_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "point_payments_select_own" ON point_payments
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE INDEX idx_point_payments_user_id ON point_payments(user_id);
CREATE INDEX idx_point_payments_reference ON point_payments(reference);
CREATE INDEX idx_point_payments_status ON point_payments(status);

-- ============================================================================
-- Idempotent wallet credit for a successful Paystack payment.
-- Marks the intent 'success' only if it is still pending, then credits the
-- wallet. If already credited (webhook + verify raced), it just returns the
-- current balance.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.credit_point_payment(
  p_user_id UUID,
  p_reference TEXT
)
RETURNS TABLE(success BOOLEAN, new_balance INT, message TEXT)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_payment RECORD;
  v_balance INT;
BEGIN
  SELECT * INTO v_payment FROM point_payments WHERE reference = p_reference AND user_id = p_user_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::INT, 'payment not found';
    RETURN;
  END IF;

  IF v_payment.status = 'success' THEN
    SELECT COALESCE(balance, 0) INTO v_balance FROM point_wallets WHERE user_id = p_user_id;
    RETURN QUERY SELECT TRUE, v_balance, 'already credited';
    RETURN;
  END IF;

  IF v_payment.status <> 'pending' THEN
    RETURN QUERY SELECT FALSE, NULL::INT, 'payment is ' || v_payment.status;
    RETURN;
  END IF;

  -- Record purchase (+ bonus) point transactions
  INSERT INTO point_transactions (user_id, type, amount, description, reference, status, completed_at)
  VALUES (p_user_id, 'purchase', v_payment.points + v_payment.bonus,
          'Purchased ' || v_payment.points || ' points package', p_reference, 'success', NOW());

  IF v_payment.bonus > 0 THEN
    INSERT INTO point_transactions (user_id, type, amount, description, reference, status, completed_at)
    VALUES (p_user_id, 'bonus', v_payment.bonus, 'Purchase bonus', p_reference || '_bonus', 'success', NOW());
  END IF;

  -- Update wallet
  INSERT INTO point_wallets (user_id, balance, lifetime_points)
  VALUES (p_user_id, v_payment.points + v_payment.bonus, v_payment.points + v_payment.bonus)
  ON CONFLICT (user_id) DO UPDATE SET
    balance = point_wallets.balance + v_payment.points + v_payment.bonus,
    lifetime_points = point_wallets.lifetime_points + v_payment.points + v_payment.bonus;

  UPDATE point_payments SET status = 'success', completed_at = NOW() WHERE id = v_payment.id;

  SELECT COALESCE(balance, 0) INTO v_balance FROM point_wallets WHERE user_id = p_user_id;
  RETURN QUERY SELECT TRUE, v_balance, 'credited';
END;
$$;

GRANT EXECUTE ON FUNCTION public.credit_point_payment(UUID, TEXT) TO authenticated, service_role;