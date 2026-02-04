# @hired4/models

Package TypeScript contenant les entités et DTOs partagés pour l'application Hired4.

## Description

Ce package définit les interfaces TypeScript (entités) et les classes de validation (DTOs) communes utilisées entre le frontend et le backend de l'application de mise en relation professionnelle Hired4.

## Structure

```
packages/models/
├── src/
│   ├── entities/        # Interfaces TypeScript des entités métier
│   ├── dto/            # Classes de validation avec décorateurs
│   └── entry.ts        # Point d'entrée principal
```

## Entités

Les entités sont des interfaces TypeScript qui définissent la structure des données métier :

### Entité de base

- **BaseEntity** : Interface de base avec `id`, `createdAt`, `updatedAt`

### Entités principales

- **User** : Utilisateur avec profil, compétences, rôle et localisation
- **Company** : Entreprise avec nom, description et site web
- **Offer** : Offre d'emploi avec titre, description, fourchette salariale et compétences requises
- **Application** : Candidature d'un utilisateur à une offre avec statut et fichiers joints
- **Conversation** : Discussion entre participants liée à une offre
- **Message** : Message individuel dans une conversation
- **File** : Fichier avec métadonnées (hash, taille)
- **Skill** : Énumération de compétences professionnelles par domaine
- **Role** : Énumération des rôles (`admin`, `user`)

### Objets utilitaires

- **SalaryRange** : Fourchette salariale (min/max)
- **Metadata** : Métadonnées de fichier (taille, hash)

## DTOs (Data Transfer Objects)

Les DTOs sont des classes avec décorateurs de validation pour garantir l'intégrité des données.

### DTO de base

- **BaseDTO** : Classe de base avec `id`, `createdAt`, `updatedAt` et validation par décorateurs

### DTOs Utilisateur

- **CreateUserDto** : Création d'utilisateur (email, password ≥ 8 caractères, nom, rôle, compétences)
- **UpdateUserDTO** : Mise à jour partielle (`PartialType` de `CreateUserDto`)
- **UserDto** : Utilisateur complet avec validation de numéro de téléphone
- **LoginDTO** : Authentification avec email et mot de passe fort
- **RegisterDTO** : Inscription avec validation stricte du mot de passe (8+ caractères, majuscule, minuscule, chiffre, symbole)
- **ChangePasswordDto** : Changement de mot de passe avec ancien/nouveau mot de passe

### DTOs Entreprise

- **CreateCompanyDto** : Création d'entreprise (nom, description, site web)
- **UpdateCompanyDTO** : Mise à jour partielle
- **CompanyDto** : Entreprise complète avec dates de création/modification

### DTOs Offre d'emploi

- **CreateOfferDto** : Création d'offre (titre, description, localisation, salaire, compétences)
- **UpdateOfferDTO** : Mise à jour partielle
- **OfferDto** : Offre complète avec entreprise associée et fichiers joints

### DTOs Conversation & Message

- **CreateConversationDto** : Création de conversation liée à une offre
- **ConversationDto** : Conversation avec participants et offre associée
- **CreateMessageDto** : Message avec validation de longueur (1-5000 caractères) et trim automatique
- **UpdateMessageDTO** : Mise à jour partielle
- **MessageDto** : Message complet avec ID de conversation et expéditeur

### DTOs Fichier

- **FileDto** : Fichier avec métadonnées optionnelles
- **FileUploadResponseDto** : Réponse après upload de fichier

### DTOs utilitaires

- **SalaryRangeDTO** : Fourchette salariale avec validation (min ≥ 0, max ≥ 0)
- **MetadataDTO** : Métadonnées de fichier (taille positive, hash)

## Validation

Les DTOs utilisent `class-validator` pour la validation automatique :

### Décorateurs de type

- `@IsString()`, `@IsNumber()`, `@IsBoolean()`, `@IsDate()`
- `@IsEmail()`, `@IsUUID()`, `@IsPhoneNumber()`
- `@IsEnum(EnumType)`, `@IsArray()`

### Décorateurs de contrainte

- `@IsOptional()` : Champ optionnel
- `@MinLength(n)`, `@MaxLength(n)` : Longueur de chaîne
- `@Min(n)` : Valeur minimale
- `@IsPositive()` : Nombre positif
- `@IsNotEmpty()` : Valeur non vide
- `@IsStrongPassword()` : Mot de passe fort (options configurables)

### Décorateurs de transformation

- `@Type(() => ClassType)` : Transformation en instance de classe (ex: Date)
- `@Transform(({ value }) => value.trim())` : Transformation personnalisée
- `@ValidateNested()` : Validation d'objets imbriqués
- `@ValidateIf()` : Validation conditionnelle

### Exemple de mot de passe fort

```typescript
@IsStrongPassword({
  minLength: 8,
  minLowercase: 1,
  minUppercase: 1,
  minNumbers: 1,
  minSymbols: 1,
})
password: string;
```

## Compétences professionnelles

L'énumération `Skill` couvre 7 domaines :

- **Software Engineer** : Langages, architecture, frontend/backend, bases de données, Git, DevOps
- **Product Manager** : Roadmap, analyse besoins, Agile, communication, KPIs, stratégie
- **Designer** : UX/UI, Figma/Sketch, design systems, accessibilité, branding
- **Data Scientist** : Statistiques, ML/DL, Python/R/SQL, visualisation, MLOps, Big Data
- **QA Engineer** : Tests (unitaires, E2E), automation, CI/CD, bug tracking

## Dépendances

- `class-validator` : Validation basée sur les décorateurs
- `class-transformer` : Transformation d'objets simples en instances de classe
- `@nestjs/mapped-types` : Types utilitaires (`PartialType`, `PickType`, `OmitType`)

## Utilisation

### Installation

```bash
pnpm install
```

### Build

```bash
pnpm run build
```

Génère les fichiers JavaScript et déclarations TypeScript dans le dossier `dist/`.

### Import

```typescript
import { User, CreateUserDto, LoginDTO, Skill, Role } from '@hired4/models';
```

## Architecture

- **Entités** : Définissent la structure des données (interfaces TypeScript)
- **DTOs** : Assurent la validation et la transformation des données en entrée/sortie d'API
- **Séparation des responsabilités** : Les entités représentent le domaine métier, les DTOs gèrent la communication API
