# @hired4/domain-objects

Package TypeScript contenant les objets métier partagés pour l'application Hired4.

## Description

Ce package définit les interfaces TypeScript communes utilisées entre le frontend et le backend de l'application de mise en relation professionnelle Hired4.

## Objets métier

- **User** : Utilisateur avec profil, compétences et rôle
- **Company** : Entreprise avec informations de base
- **Offer** : Offre d'emploi avec détails et exigences
- **Application** : Candidature d'un utilisateur à une offre
- **Conversation** : Discussion entre utilisateurs
- **Message** : Message dans une conversation
- **File** : Fichier attaché (CV, documents)
- **Skill** : Compétence technique ou professionnelle

## Utilisation

```bash
npx tsc
```

Génère les fichiers JavaScript et déclarations TypeScript dans le dossier `lib/`.
