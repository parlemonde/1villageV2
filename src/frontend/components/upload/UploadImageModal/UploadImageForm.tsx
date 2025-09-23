import { Button } from '@frontend/components/ui/Button';
import { Field, Input } from '@frontend/components/ui/Form';
import { UploadIcon } from '@radix-ui/react-icons';

export const isValidImageUrl = (url: string) => {
    return url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:') || url.startsWith('/media/images');
};

interface UploadImageFormProps {
    imageUrl: string;
    setImageUrlOrFile: (imageUrlOrFile: string | File) => void;
    onResize: () => void;
}

export const UploadImageForm = ({ imageUrl, setImageUrlOrFile, onResize }: UploadImageFormProps) => {
    const canResize = imageUrl.startsWith('blob:');

    return (
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch', gap: '8px' }}>
            <div style={{ flex: '1 1 0', padding: '32px 16px' }}>
                <Field
                    name="image-url"
                    label="Url de l'image"
                    input={
                        <Input
                            id="image-url"
                            name="image-url"
                            isFullWidth
                            color="secondary"
                            placeholder="Entrez l'URL de l'image"
                            onBlur={(e) => {
                                if (isValidImageUrl(e.target.value)) {
                                    setImageUrlOrFile(e.target.value);
                                }
                            }}
                        />
                    }
                />
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        margin: '32px 0',
                    }}
                >
                    <div style={{ flex: '1 1 0', height: '1px', backgroundColor: 'var(--grey-300)' }} />
                    <span style={{ flexShrink: 0 }}>Ou</span>
                    <div style={{ flex: '1 1 0', height: '1px', backgroundColor: 'var(--grey-300)' }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                    <Button
                        as="label"
                        tabIndex={0}
                        htmlFor="image-file"
                        leftIcon={<UploadIcon />}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.currentTarget.click();
                            }
                        }}
                        color="secondary"
                        variant="outlined"
                        label="Importer"
                    />
                </div>
                <input
                    style={{ display: 'none' }}
                    type="file"
                    id="image-file"
                    name="image-file"
                    value=""
                    onChange={(e) => {
                        if (e.target.files?.[0]) {
                            setImageUrlOrFile(e.target.files?.[0]);
                        }
                    }}
                />
            </div>
            <div
                style={{
                    flex: '1 1 0',
                    backgroundColor: 'var(--grey-100)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    gap: '16px',
                }}
            >
                <strong>Aperçu</strong>
                {imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageUrl} alt="Image preview" style={{ objectFit: 'contain', width: '100%', height: 'auto', maxHeight: '40vh' }} />
                )}
                {canResize && <Button label="Redimensionner" size="sm" variant="contained" isUpperCase={false} color="grey" onClick={onResize} />}
            </div>
        </div>
    );
};
