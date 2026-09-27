-- ============================================================
-- Carnet des locations : donner l'accès aux comptes
-- 1. Créer d'abord les deux comptes dans Supabase > Authentication > Users > Add user
-- 2. Remplacer les deux adresses ci-dessous par les leurs
-- 3. Coller dans SQL Editor puis "Run"
-- ============================================================

insert into public.acces (email, role) values
  ('adresse-de-maman@exemple.fr', 'gestion'),   -- peut tout faire
  ('adresse-de-papa@exemple.fr',  'lecture');   -- consulte seulement

-- Plus tard, pour changer ou retirer un accès :
--   update public.acces set role = 'gestion' where email = 'adresse@exemple.fr';
--   delete from public.acces where email = 'adresse@exemple.fr';
