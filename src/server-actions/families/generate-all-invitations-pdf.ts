'use server';

import { toHtml } from '@frontend/components/html/HtmlViewer/HtmlViewer';
import { db } from '@server/database';
import { students } from '@server/database/schemas/students';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { getCurrentVillageAndClassroomForUser } from '@server/helpers/get-current-village-and-classroom';
import { eq } from 'drizzle-orm';
import jsPDF from 'jspdf';

interface HtmlContent {
    type: 'doc';
    content: unknown[];
}

const generateStudentName = (studentName: string): unknown => {
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

const separator = {
    type: 'paragraph',
    attrs: {
        align: 'left',
    },
    content: [
        {
            type: 'text',
            text: '------------------------------------',
        },
    ],
};

export const generateAllInvitationsPdf = async (instructions: HtmlContent) => {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('Unauthorized');
    }

    const { classroom } = await getCurrentVillageAndClassroomForUser(user);
    if (!classroom) {
        throw new Error("Teacher doesn't have a classroom");
    }

    const studentList = await db.select().from(students).where(eq(students.classroomId, classroom.id)).orderBy(students.name);

    const jsonPdf: HtmlContent = {
        type: 'doc',
        content: [],
    };

    for (const student of studentList) {
        const studentCard = [generateStudentName(student.name)].concat(instructions.content).concat([separator]);
        jsonPdf.content.push(studentCard);
    }

    const html = toHtml(jsonPdf);
    if (!html) {
        return;
    }

    const doc = new jsPDF();
    doc.html(html, {
        callback: (doc) => {
            doc.save('invitations.pdf');
        },
    });
};
