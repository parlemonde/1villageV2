'use server';

import type { HtmlEditorContent } from '@frontend/components/html/HtmlEditor/HtmlEditor';
import { prosemirrorToHTML } from '@lib/prosemirror-to-html';
import { db } from '@server/database';
import type { Student } from '@server/database/schemas/students';
import { students } from '@server/database/schemas/students';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { getCurrentVillageAndClassroomForUser } from '@server/helpers/get-current-village-and-classroom';
import { ParentInvitationMessageWrapper } from '@server/pdf/ParentInvitationMessageWrapper';
import { and, eq, inArray } from 'drizzle-orm';
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

const toHtml = async (content: HtmlEditorContent) => {
    try {
        const { renderToStaticMarkup } = await import('react-dom/server');
        const message = prosemirrorToHTML(content);
        const wrapper = ParentInvitationMessageWrapper(message);
        return renderToStaticMarkup(wrapper);
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
        const htmlCard = await toHtml(cardDoc);
        const wrapper = `<div style="page-break-inside: avoid;">${htmlCard}</div>`;
        stringPdf += wrapper;
    }

    return await generatePdf(stringPdf);
};
