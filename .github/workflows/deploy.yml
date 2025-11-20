name: Deploy
on: workflow_dispatch
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      # Build the app in the dist directory
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          run_install: false
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm build
      - run: mkdir --parents dist/assets/_next; mv .next/static $_
      - run: cp -r public/* dist/assets
      - run: (cd .next/standalone && zip --symlinks -r - .) > dist/1village.zip

    # Upload the build to S3
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}
      - run: aws s3 cp dist s3://${{ secrets.AWS_BUCKET_NAME }}/builds/prod --recursive
