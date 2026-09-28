-- ============================================================
-- Carnet des locations : mise à jour du 28/09/2026
-- Ajoute le supplément draps et Le Bon Coin (canal et moyen de paiement).
-- À lancer une seule fois sur une base créée avant cette date (relançable sans risque).
-- ============================================================

alter table public.reservations add column if not exists draps_montant numeric(10,2) check (draps_montant >= 0);
alter table public.reservations add column if not exists draps_paiement text check (draps_paiement in ('airbnb', 'virement', 'especes', 'cheque', 'leboncoin'));

alter table public.reservations drop constraint if exists reservations_canal_check;
alter table public.reservations add constraint reservations_canal_check check (canal in ('airbnb', 'contact', 'leboncoin'));

alter table public.reservations drop constraint if exists reservations_paiement_check;
alter table public.reservations add constraint reservations_paiement_check check (paiement in ('airbnb', 'virement', 'especes', 'cheque', 'leboncoin'));
