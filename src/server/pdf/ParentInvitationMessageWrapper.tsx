export const ParentInvitationMessageWrapper = (children: string) => {
    const styles: Record<string, React.CSSProperties> = {
        '*': { margin: '0' },
        br: { lineHeight: 0.5 },
    };

    return (
        <div>
            <style>
                {`
                    ${Object.entries(styles)
                        .map(
                            ([selector, style]) =>
                                `${selector} { ${Object.entries(style)
                                    .map(([key, value]) => `${key}: ${value};`)
                                    .join(' ')} }`,
                        )
                        .join('')}
                `}
            </style>
            <div dangerouslySetInnerHTML={{ __html: children }}></div>
        </div>
    );
};
