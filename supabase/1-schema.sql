-- ============================================================
-- Carnet des locations : création de la base
-- À coller en entier dans Supabase > SQL Editor > New query, puis "Run".
-- ============================================================

-- Nécessaire pour interdire deux réservations qui se chevauchent sur un même appartement
create extension if not exists btree_gist;

-- ---------- Appartements et grille de tarifs ----------
create table public.appartements (
  id            smallint primary key check (id between 1 and 3),
  nom           text not null,
  tarif_nuit    numeric(10,2) not null default 0 check (tarif_nuit >= 0),     -- prix d'une nuit
  tarif_semaine numeric(10,2) not null default 0 check (tarif_semaine >= 0),  -- prix par nuit dès 7 nuits
  tarif_mois    numeric(10,2) not null default 0 check (tarif_mois >= 0)      -- prix pour un mois
);

insert into public.appartements (id, nom) values
  (1, 'Appartement 1'),
  (2, 'Appartement 2'),
  (3, 'Appartement 3');

-- ---------- Réservations ----------
create table public.reservations (
  id              uuid primary key default gen_random_uuid(),
  client          text not null check (length(trim(client)) > 0),
  appartement     smallint not null references public.appartements(id),
  arrivee         date not null,
  depart          date not null,
  personnes       smallint not null default 1 check (personnes between 1 and 20),
  canal           text not null constraint reservations_canal_check check (canal in ('airbnb', 'contact', 'leboncoin')),
  tarif_theorique numeric(10,2),                                     -- plus utilisé
  tarif_reel      numeric(10,2) not null check (tarif_reel >= 0),   -- pour Airbnb : montant net reçu
  paiement        text not null constraint reservations_paiement_check check (paiement in ('airbnb', 'virement', 'especes', 'cheque', 'leboncoin')),
  draps_montant   numeric(10,2) check (draps_montant >= 0),          -- supplément draps (vide = pas de draps)
  draps_paiement  text check (draps_paiement in ('airbnb', 'virement', 'especes', 'cheque', 'leboncoin')),
  paye            boolean not null default false,
  notes           text,
  cree_le         timestamptz not null default now(),
  modifie_le      timestamptz not null default now(),
  constraint depart_apres_arrivee check (depart > arrivee),
  -- Le jour du départ reste libre pour une nouvelle arrivée
  constraint pas_de_chevauchement exclude using gist (
    appartement with =,
    daterange(arrivee, depart) with &&
  )
);

create index reservations_arrivee_idx on public.reservations (arrivee);

create or replace function public.maj_modifie_le() returns trigger
language plpgsql as $$
begin
  new.modifie_le = now();
  return new;
end $$;

create trigger reservations_modifie_le
  before update on public.reservations
  for each row execute function public.maj_modifie_le();

-- ---------- Accès : qui peut voir, qui peut modifier ----------
-- role 'gestion' : tout faire ; role 'lecture' : consulter seulement
create table public.acces (
  email text primary key,
  role  text not null check (role in ('gestion', 'lecture'))
);

-- Rôle de la personne connectée (null si son e-mail n'est pas dans la table acces)
create or replace function public.mon_role() returns text
language sql stable security definer set search_path = public as $$
  select role from public.acces where lower(email) = lower(auth.jwt() ->> 'email')
$$;

revoke execute on function public.mon_role() from public, anon;
grant execute on function public.mon_role() to authenticated;

-- Droits de base pour les personnes connectées (affinés ensuite par les règles ci-dessous)
grant select, update on public.appartements to authenticated;
grant select, insert, update, delete on public.reservations to authenticated;
grant select on public.acces to authenticated;
revoke all on public.appartements, public.reservations, public.acces from anon;

-- ---------- Sécurité ligne par ligne ----------
alter table public.appartements enable row level security;
alter table public.reservations enable row level security;
alter table public.acces enable row level security;

create policy "voir les appartements" on public.appartements
  for select to authenticated using (public.mon_role() is not null);
create policy "modifier les appartements" on public.appartements
  for update to authenticated
  using (public.mon_role() = 'gestion') with check (public.mon_role() = 'gestion');

create policy "voir les réservations" on public.reservations
  for select to authenticated using (public.mon_role() is not null);
create policy "ajouter une réservation" on public.reservations
  for insert to authenticated with check (public.mon_role() = 'gestion');
create policy "modifier une réservation" on public.reservations
  for update to authenticated
  using (public.mon_role() = 'gestion') with check (public.mon_role() = 'gestion');
create policy "supprimer une réservation" on public.reservations
  for delete to authenticated using (public.mon_role() = 'gestion');

create policy "voir son propre accès" on public.acces
  for select to authenticated using (lower(email) = lower(auth.jwt() ->> 'email'));
