'use server';

import type { HtmlEditorContent } from '@frontend/components/html/HtmlEditor/HtmlEditor';
import { schema, viewSchema } from '@lib/html-schema';
import { db } from '@server/database';
import type { Student } from '@server/database/schemas/students';
import { students } from '@server/database/schemas/students';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { getCurrentVillageAndClassroomForUser } from '@server/helpers/get-current-village-and-classroom';
import { and, eq, inArray } from 'drizzle-orm';
import { JSDOM } from 'jsdom';
import { DOMSerializer, Node } from 'prosemirror-model';
import puppeteer from 'puppeteer';

const separator = {
    type: 'paragraph',
    attrs: {
        align: 'left',
    },
    content: [
        {
            type: 'text',
            text: '- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -',
        },
    ],
};

const generateStudentName = (studentName: string) => {
    return {
        type: 'paragraph',
        attrs: {
            align: 'left',
        },
        content: [
            {
                type: 'text',
                text: 'Élève : ',
            },
            {
                type: 'text',
                marks: [
                    {
                        type: 'bold',
                    },
                ],
                text: studentName,
            },
        ],
    };
};

const createVirtualDom = () => {
    const styles: Record<string, React.CSSProperties> = {
        '*': { margin: '0' },
        br: { lineHeight: 0.5 },
    };
    const domString = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
            ${Object.entries(styles)
                .map(
                    ([selector, style]) =>
                        `${selector} { ${Object.entries(style)
                            .map(([key, value]) => `${key}: ${value};`)
                            .join(' ')} }`,
                )
                .join('')}
            </style></head><body></body></html>`;

    return new JSDOM(domString);
};

const toHtml = (content: HtmlEditorContent) => {
    try {
        const dom = createVirtualDom();
        const { document } = dom.window;

        const serializer = DOMSerializer.fromSchema(viewSchema);

        const doc = Node.fromJSON(schema, content);
        const element = serializer.serializeFragment(doc.content, { document });
        const divElement = document.createElement('div');
        divElement.appendChild(element);
        document.body.appendChild(divElement);
        return dom.serialize();
    } catch (e) {
        // ignore
        console.error(e);
        return null;
    }
};

const generateStudentCard = (student: Student, instructions: HtmlEditorContent): unknown[] => {
    return [generateStudentName(student.name), ...instructions.content, separator];
};

const generatePdf = async (pdf: string): Promise<Uint8Array<ArrayBufferLike>> => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(pdf, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', scale: 0.98, margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' } });

    await browser.close();
    return pdfBuffer;
};

export const generateInvitationsPdf = async (instructions: HtmlEditorContent, studentListIds?: number[]) => {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('Unauthorized');
    }

    const { classroom } = await getCurrentVillageAndClassroomForUser(user);
    if (!classroom) {
        throw new Error("Teacher doesn't have a classroom");
    }

    const filters =
        studentListIds && studentListIds.length > 0
            ? and(eq(students.classroomId, classroom.id), inArray(students.id, studentListIds))
            : eq(students.classroomId, classroom.id);

    const studentList = await db.select().from(students).where(filters).orderBy(students.name);

    let stringPdf = '';
    const jsonAsString = JSON.stringify(instructions);

    for (const student of studentList) {
        if (!student.inviteCode) {
            continue;
        }

        const stringWithInviteCode = jsonAsString.replace('%code', student.inviteCode);
        const filledInstructions: HtmlEditorContent = JSON.parse(stringWithInviteCode);
        const card = generateStudentCard(student, filledInstructions);

        const cardDoc: HtmlEditorContent = {
            type: 'doc',
            content: card,
        };
        const htmlCard = toHtml(cardDoc);
        const wrapper = `<div style="page-break-inside: avoid;">${htmlCard}</div>`;
        stringPdf += wrapper;
    }

    return await generatePdf(stringPdf);
};
