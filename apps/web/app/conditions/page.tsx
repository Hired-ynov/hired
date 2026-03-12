export default function ConditionsPage() {
  return (
    <div className="max-w-[800px] mx-auto py-10 px-6 leading-relaxed">
      <header className="mb-10 text-center">
        <h1>{`Conditions d'Utilisation`}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>
      </header>

      <div className="flex flex-col gap-8">
        <section>
          <h2 className="mb-4">1. Acceptation des Conditions</h2>
          <p className="mb-4">
            {`En accédant et en utilisant la plateforme Hired, vous acceptez d'être lié par ces conditions
                        d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.`}
          </p>
          <div className="bg-[var(--background-secondary)] p-4 rounded-lg border-l-4 border-[var(--primary)]">
            <p className="m-0">
              {`Ces conditions s'appliquent à tous les utilisateurs de la plateforme, qu'ils soient
                            candidats, employeurs ou visiteurs.`}
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-4">2. Description du Service</h2>
          <p className="mb-3">
            Hired est une plateforme de mise en relation professionnelle qui
            permet :
          </p>
          <ul className="ml-5 mb-4">
            <li className="mb-2">{`Aux candidats de créer un profil et postuler à des offres d'emploi`}</li>
            <li className="mb-2">
              Aux entreprises de publier des offres et rechercher des candidats
            </li>
            <li className="mb-2">
              La communication directe entre candidats et employeurs
            </li>
            <li className="mb-2">
              Le partage de documents professionnels (CV, lettres de motivation)
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4">3. Inscription et Comptes Utilisateurs</h2>
          <h3 className="mb-3">3.1 Création de Compte</h3>
          <p className="mb-4">
            Pour utiliser nos services, vous devez créer un compte en
            fournissant des informations exactes et complètes. Vous êtes
            responsable de maintenir la confidentialité de vos identifiants de
            connexion.
          </p>

          <h3 className="mb-3">3.2 Types de Comptes</h3>
          <ul className="ml-5 mb-4">
            <li className="mb-2">
              <strong>Compte Candidat :</strong> Permet de postuler aux offres
              et communiquer avec les employeurs
            </li>
            <li className="mb-2">
              <strong>Compte Entreprise :</strong> Permet de publier des offres
              et contacter des candidats
            </li>
            <li className="mb-2">
              <strong>Compte Administrateur :</strong> Gestion de la plateforme
              (usage interne uniquement)
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4">4. Obligations des Utilisateurs</h2>
          <h3 className="mb-3">4.1 Utilisation Appropriée</h3>
          <p className="mb-3">Vous vous engagez à :</p>
          <ul className="ml-5 mb-4">
            <li className="mb-2">Fournir des informations exactes et à jour</li>
            <li className="mb-2">Respecter les autres utilisateurs</li>
            <li className="mb-2">
              Ne pas publier de contenu inapproprié ou discriminatoire
            </li>
            <li className="mb-2">
              Respecter les droits de propriété intellectuelle
            </li>
            <li className="mb-2">
              Ne pas tenter de contourner les mesures de sécurité
            </li>
          </ul>

          <h3 className="mb-3">4.2 Contenu Interdit</h3>
          <div className="bg-[var(--background-secondary)] p-5 rounded-xl border-2 border-[var(--error)] mb-4">
            <p className="font-semibold mb-2">
              Il est strictement interdit de publier :
            </p>
            <ul className="ml-5 m-0">
              <li>{`Contenu offensant, discriminatoire ou haineux`}</li>
              <li>{`Informations fausses ou trompeuses`}</li>
              <li>{`Contenu violant les droits d'autrui`}</li>
              <li>{`Spam ou contenu promotionnel non autorisé`}</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="mb-4">{`5. Gestion des Offres d'Emploi`}</h2>
          <h3 className="mb-3">{`5.1 Publication d'Offres`}</h3>
          <p className="mb-4">
            {`Les entreprises peuvent publier des offres d'emploi qui doivent être légales, précises et non
                        discriminatoires. Nous nous réservons le droit de modérer ou supprimer toute offre ne respectant pas ces
                        critères.`}
          </p>

          <h3 className="mb-3">{`5.2 Candidatures`}</h3>
          <p className="mb-4">
            {`Les candidatures passent par plusieurs statuts : en attente, examinée, acceptée ou refusée. Les candidats
                        peuvent suivre l'évolution de leurs candidatures via leur tableau de bord.`}
          </p>
        </section>

        <section>
          <h2 className="mb-4">{`6. Propriété Intellectuelle`}</h2>
          <p className="mb-3">
            {`La plateforme Hired, son design, ses fonctionnalités et son contenu sont protégés par les droits de propriété
                        intellectuelle. Vous conservez la propriété du contenu que vous publiez, mais vous nous accordez une licence
                        d'utilisation nécessaire au fonctionnement du service.`}
          </p>
          <ul className="ml-5 mb-4">
            <li className="mb-2">
              Vous restez propriétaire de vos CV et documents
            </li>
            <li className="mb-2">
              Nous pouvons utiliser vos données pour améliorer nos services
            </li>
            <li className="mb-2">
              Respect mutuel des droits de propriété intellectuelle
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4">7. Limitation de Responsabilité</h2>
          <div className="bg-[var(--background-secondary)] p-5 rounded-xl mb-4">
            <p className="mb-3">
              {`Hired agit en tant qu'intermédiaire de mise en relation. Nous ne sommes pas responsables :`}
            </p>
            <ul className="ml-5 m-0">
              <li className="mb-2">
                Des accords conclus entre candidats et employeurs
              </li>
              <li className="mb-2">
                De la véracité des informations fournies par les utilisateurs
              </li>
              <li className="mb-2">
                Des décisions de recrutement des entreprises
              </li>
              <li className="mb-2">Des interruptions temporaires du service</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="mb-4">8. Suspension et Résiliation</h2>
          <h3 className="mb-3">{`8.1 Par l'Utilisateur`}</h3>
          <p className="mb-4">
            {`Vous pouvez supprimer votre compte à tout moment depuis les paramètres de votre profil. La suppression entraîne
                        l'effacement de vos données personnelles conformément à notre politique de confidentialité.`}
          </p>

          <h3 className="mb-3">8.2 Par Hired</h3>
          <p className="mb-4">
            {`Nous nous réservons le droit de suspendre ou supprimer un compte en cas de violation de ces conditions
                        d'utilisation, avec ou sans préavis selon la gravité de l'infraction.`}
          </p>
        </section>

        <section>
          <h2 className="mb-4">9. Modifications des Conditions</h2>
          <p>
            {`Nous pouvons modifier ces conditions d'utilisation à tout moment. Les modifications importantes seront
                        notifiées par email ou via notre plateforme. L'utilisation continue du service après notification constitue
                        une acceptation des nouvelles conditions.`}
          </p>
        </section>

        <section>
          <h2 className="mb-4">10. Droit Applicable et Juridiction</h2>
          <p className="mb-4">
            {`Ces conditions d'utilisation sont régies par le droit français. En cas de litige, les tribunaux français
                        seront seuls compétents.`}
          </p>
        </section>

        <section>
          <h2 className="mb-4">11. Contact et Support</h2>
          <p className="mb-4">{`Pour toute question concernant ces conditions d'utilisation ou notre service :`}</p>
          <div className="bg-[var(--background-secondary)] p-5 rounded-xl">
            <p>
              <strong>Email :</strong> support@hired.com
            </p>
            <p>
              <strong>Email juridique :</strong> legal@hired.com
            </p>
            <p>
              <strong>Adresse :</strong> {`[Adresse de l'entreprise]`}
            </p>
            <p>
              <strong>Téléphone :</strong> {`[Numéro de téléphone]`}
            </p>
          </div>
        </section>
      </div>

      <div className="mt-10 p-5 text-center bg-[var(--background-tertiary)] rounded-xl">
        <p
          className="text-sm italic mb-2"
          style={{ color: 'var(--text-secondary)' }}
        >
          {`En utilisant Hired, vous acceptez ces conditions d'utilisation ainsi que notre politique de
                    confidentialité.`}
        </p>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          Version 1.0 - Effective depuis le{' '}
          {new Date().toLocaleDateString('fr-FR')}
        </p>
      </div>
    </div>
  );
}
