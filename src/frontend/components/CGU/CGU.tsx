import React from 'react';

import styles from './cgu.module.css';

export const CGU = () => {
    return (
        <div className={styles.cguBlock}>
            <div className={styles.textCenter} style={{ marginBottom: '1rem' }}>
                <h2 className={styles.textPrimary}>Conditions générales d&apos;utilisation 1Village</h2>
            </div>
            <h3 className={styles.textOrangeBackground}>1. Respect de certaines dispositions sur la plateforme 1Village</h3>
            <p>
                En tant que professeur des écoles, utilisateur de la plateforme 1v.parlemonde.org, je m&apos;engage à ne mettre en ligne aucun contenu
                qui contreviendrait à la législation applicable, notamment tout message à caractère raciste, injurieux, diffamant, ou pornographique,
                quel que soit le support utilisé (texte, photographie, vidéo, …).
            </p>
            <br />
            <p>
                <strong>Je m&apos;engage notamment à respecter la législation relative au droit à l&apos;image</strong>, en particulier, je
                m&apos;engage à ne mettre en ligne que des photos ou vidéos enfants pour lesquelles je possède une autorisation valide et signée
                d&apos;un parent ou du tuteur légal.
            </p>
            <br />
            <p>
                Je comprends et j&apos;accepte que l&apos;association Par Le Monde ne peut être considérée comme responsable des contenus illégaux que
                je mettrais en ligne sur la plateforme 1v.parlemonde.org.
            </p>
            <br />
            <h3 className={styles.textOrangeBackground}>2. Acceptation des mentions légales du site https://www.parlemonde.org</h3>
            <p>
                Je prends connaissance et j&apos;accepte les mentions légales telles que précisées à l&apos;adresse suivante :
                <a href="https://www.parlemonde.org/mentions-legales/" target="_blank" rel="noreferrer">
                    https://www.parlemonde.org/mentions-legales/
                </a>
            </p>

            <br />
            <h3 className={styles.textOrangeBackground}>3. Adhésion à l&apos;association Par Le Monde</h3>
            <p>
                Je prends connaissance des statuts et du règlement intérieur de l&apos;association Par Le Monde et consens, conformément aux
                dispositions statutaires (articles 5 et 11 des statuts, articles 1 et 2 du règlement intérieur), à devenir membre de droit de
                l&apos;association l&apos;année suivant ma participation à l&apos;un des programmes porté par l&apos;association.
            </p>
            <br />
            <p>Ce statut me donne un droit de vote aux assemblées générales de l&apos;association Par Le Monde.</p>
            <br />
            <p>
                Pour rappel : sont membres de droit les professeurs ou écoles participant à un programme porté par l&apos;association tel que défini
                dans le règlement intérieur, et ayant donné leur accord à devenir membres de droit. Tous les membres de droit ont le pouvoir de voter
                à l&apos;assemblée générale. Aucune cotisation n&apos;est demandée à ce jour pour les professeurs participant à 1Village.
            </p>
            <h3 className={styles.textOrangeBackground}>4. Notification 1Village</h3>
            <p>
                Je donne mon accord pour recevoir des notifications sur l&apos;activité d&apos;1Village. À tout moment de l&apos;année elles seront
                désactivables dans l&apos;espace &quot;mon compte&quot; prévu à cet effet.
            </p>
        </div>
    );
};
