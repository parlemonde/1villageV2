import { Title } from '@frontend/components/ui/Title';

import { Activities } from './Activities';

export default function Home() {
    return (
        <>
            <div
                style={{
                    width: '100%',
                    height: '300px',
                    backgroundColor: 'black',
                    borderTopLeftRadius: '10px',
                    borderTopRightRadius: '10px',
                    overflow: 'hidden',
                }}
            ></div>
            <div style={{ margin: '8px 16px' }}>
                <Title>Dernières activités</Title>
                <Activities />
            </div>
        </>
    );
}
