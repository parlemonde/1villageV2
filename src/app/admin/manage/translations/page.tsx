import { Breadcrumbs } from '@frontend/components/ui/Breadcrumbs/Breadcrumbs';
import { Button } from '@frontend/components/ui/Button';
import { PageContainer } from '@frontend/components/ui/PageContainer/PageContainer';
import { Title } from '@frontend/components/ui/Title';
import { ChevronLeftIcon } from '@radix-ui/react-icons';

export default function AdminManageTranslationsPage() {
    return (
        <PageContainer>
            <Breadcrumbs breadcrumbs={[{ label: 'Gérer', href: '/admin/manage' }, { label: 'Traductions' }]} />
            <div
                style={{
                    display: 'flex',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    flexDirection: 'row',
                    gap: '16px',
                    margin: '16px 0',
                }}
            >
                <Title style={{ flex: '1 1 0' }}>Gestion des traductions</Title>
            </div>
            {/* Translation management content will be added here */}
            <div
                style={{
                    padding: '24px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px',
                    marginTop: '24px',
                    marginBottom: '24px',
                    textAlign: 'center',
                    color: '#666',
                }}
            >
                <p>La gestion des traductions sera implémentée ici.</p>
            </div>
            <Button
                as="a"
                color="primary"
                variant="outlined"
                label="Retour"
                href="/admin/manage"
                marginTop="lg"
                leftIcon={<ChevronLeftIcon width={18} height={18} />}
            />
        </PageContainer>
    );
}
