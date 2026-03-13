export default function PrivacyPage() {
  return (
    <div className="max-w-[800px] mx-auto py-10 px-6 leading-relaxed">
      <header className="mb-10 text-center">
        <h1 className="mb-4">Politique de Confidentialité</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>
      </header>

      <div className="flex flex-col gap-8">
        <section>
          <h2 className="mb-4">1. Introduction</h2>
          <p className="mb-4">
            Chez Hired, nous nous engageons à protéger votre vie privée et vos
            données personnelles. Cette politique de confidentialité explique
            comment nous collectons, utilisons et protégeons vos informations
            personnelles lorsque vous utilisez notre plateforme de mise en
            relation professionnelle.
          </p>
        </section>

        <section>
          <h2 className="mb-4">2. Données Collectées</h2>
          <p className="mb-3">Nous collectons les informations suivantes :</p>
          <ul className="ml-5 mb-4">
            <li className="mb-2">
              <strong>Informations d&apos;identification :</strong> Nom, prénom,
              adresse email
            </li>
            <li className="mb-2">
              <strong>Informations de contact :</strong> Numéro de téléphone,
              localisation
            </li>
            <li className="mb-2">
              <strong>Informations professionnelles :</strong> Compétences,
              expériences, CV et documents
            </li>
            <li className="mb-2">
              <strong>Données de connexion :</strong> Mots de passe chiffrés,
              historique de connexion
            </li>
            <li className="mb-2">
              <strong>Communications :</strong> Messages échangés via notre
              plateforme
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4">3. Utilisation des Données</h2>
          <p className="mb-3">
            Vos données sont utilisées exclusivement pour :
          </p>
          <ul className="ml-5 mb-4">
            <li className="mb-2">Créer et gérer votre compte utilisateur</li>
            <li className="mb-2">
              Faciliter la mise en relation entre candidats et employeurs
            </li>
            <li className="mb-2">
              Permettre la communication via notre système de messagerie
            </li>
            <li className="mb-2">
              Améliorer nos services et l&apos;expérience utilisateur
            </li>
            <li className="mb-2">
              Assurer la sécurité et l&apos;intégrité de notre plateforme
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4">4. Traitement Interne des Données</h2>
          <div className="bg-[var(--background-secondary)] p-5 rounded-xl border-2 border-[var(--primary)] mb-4">
            <p className="font-semibold mb-2">Engagement Important :</p>
            <p className="m-0">
              Toutes vos données personnelles sont traitées exclusivement en
              interne par notre équipe. Nous ne vendons, ne louons, ni ne
              partageons vos informations personnelles avec des tiers à des fins
              commerciales ou publicitaires.
            </p>
          </div>
          <p>
            Vos données restent strictement confidentielles et ne sont
            accessibles qu&apos;aux membres autorisés de notre équipe dans le
            cadre de la fourniture de nos services.
          </p>
        </section>

        <section>
          <h2 className="mb-4">5. Sécurité des Données</h2>
          <p className="mb-3">
            Nous mettons en place des mesures de sécurité techniques et
            organisationnelles appropriées :
          </p>
          <ul className="ml-5 mb-4">
            <li className="mb-2">
              Chiffrement des mots de passe et des données sensibles
            </li>
            <li className="mb-2">Connexions sécurisées (HTTPS)</li>
            <li className="mb-2">Accès restreint aux données personnelles</li>
            <li className="mb-2">Sauvegardes régulières et sécurisées</li>
            <li className="mb-2">Surveillance continue de la sécurité</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4">6. Conservation des Données</h2>
          <p>
            Nous conservons vos données personnelles aussi longtemps que votre
            compte est actif ou selon les exigences légales. Vous pouvez
            demander la suppression de vos données à tout moment en nous
            contactant. Après suppression, certaines informations peuvent être
            conservées de manière anonymisée à des fins statistiques.
          </p>
        </section>

        <section>
          <h2 className="mb-4">7. Vos Droits</h2>
          <p className="mb-3">
            Conformément à la réglementation en vigueur, vous disposez des
            droits suivants :
          </p>
          <ul className="ml-5 mb-4">
            <li className="mb-2">
              <strong>Droit d&apos;accès :</strong> Consulter les données que
              nous détenons sur vous
            </li>
            <li className="mb-2">
              <strong>Droit de rectification :</strong> Corriger les
              informations inexactes
            </li>
            <li className="mb-2">
              <strong>Droit à l&apos;effacement :</strong> Demander la
              suppression de vos données
            </li>
            <li className="mb-2">
              <strong>Droit à la portabilité :</strong> Récupérer vos données
              dans un format structuré
            </li>
            <li className="mb-2">
              <strong>Droit d&apos;opposition :</strong> Vous opposer au
              traitement de vos données
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4">8. Cookies et Technologies Similaires</h2>
          <p>
            Notre site utilise des cookies essentiels au fonctionnement de la
            plateforme (authentification, préférences utilisateur). Ces cookies
            ne sont pas utilisés à des fins de suivi publicitaire et restent
            strictement nécessaires à la fourniture de nos services.
          </p>
        </section>

        <section>
          <h2 className="mb-4">9. Modifications de cette Politique</h2>
          <p>
            Nous pouvons mettre à jour cette politique de confidentialité
            occasionnellement. Toute modification importante vous sera notifiée
            par email ou via notre plateforme. La date de dernière mise à jour
            est indiquée en haut de cette page.
          </p>
        </section>

        <section>
          <h2 className="mb-4">10. Contact</h2>
          <p className="mb-4">
            Pour toute question concernant cette politique de confidentialité ou
            pour exercer vos droits, vous pouvez nous contacter :
          </p>
          <div className="bg-[var(--background-secondary)] p-5 rounded-xl">
            <p>
              <strong>Email :</strong> privacy@hired.com
            </p>
            <p>
              <strong>Adresse :</strong> [Adresse de l&apos;entreprise]
            </p>
            <p>
              <strong>Téléphone :</strong> [Numéro de téléphone]
            </p>
          </div>
        </section>
      </div>

      <div className="mt-10 p-5 text-center bg-[var(--background-tertiary)] rounded-xl">
        <p
          className="text-sm italic"
          style={{ color: 'var(--text-secondary)' }}
        >
          Cette politique de confidentialité fait partie intégrante de nos
          conditions d&apos;utilisation.
        </p>
      </div>
    </div>
  );
}
