import Link from 'next/link';
import React from 'react';

import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Button } from '@frontend/components/ui/Button';

const Story = () => {
  return (
    <PageContainer title="Inventer une histoire">
        <p className="text">
          Pour inventer une histoire, vous allez devoir imaginer votre village-monde idéal et le présenter aux pélicopains à travers des textes et des
          images. Pour cela, plusieurs étapes vous attendent…
        </p>
        <p className="text">Vous êtes prêts ? 1, 2, 3 fermez les yeux et laissez libre court à votre imagination !</p>
        <Link href="/creer-une-histoire/1" passHref>
          <Button as="a" href="/creer-une-histoire/1" variant="outlined" color="primary" label="Commencer"/>
        </Link>
   </PageContainer>
  );
};

export default Story;
