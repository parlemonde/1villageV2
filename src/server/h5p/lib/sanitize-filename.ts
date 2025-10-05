import { H5pError, utils } from '@lumieducation/h5p-server';

const { generalizedSanitizeFilename } = utils;

/**
 * Checks if the filename can be used in S3 storage. Throws errors if the
 * filename is not valid
 * @param filename the filename to check
 * @returns no return value; throws errors if the filename is not valid
 */
export function validateFilename(filename: string): void {
    if (/\.\.\//.test(filename)) {
        console.error(`Relative paths in filenames are not allowed: ${filename} is illegal`);
        throw new H5pError('illegal-filename', { filename }, 400);
    }
    if (filename.startsWith('/')) {
        console.error(`Absolute paths in filenames are not allowed: ${filename} is illegal`);
        throw new H5pError('illegal-filename', { filename }, 400);
    }

    // See https://docs.aws.amazon.com/AmazonS3/latest/dev/UsingMetadata.html
    // for a list of problematic characters. We filter all of them out
    // expect for ranges of non-printable ASCII characters:
    // &$@=;:+ ,?\\{^}%`]'">[~<#

    if (/[^A-Za-z0-9\-._!()@/]/g.test(filename)) {
        console.error(`Found illegal character in filename: ${filename}`);
        throw new H5pError('illegal-filename', { filename }, 400);
    }
}

/**
 * Sanitizes a filename or path by shortening it to the specified maximum length
 * and removing the invalid characters in the RegExp. If you don't specify a
 * RegExp a very strict invalid character list will be used that only leaves
 * alphanumeric filenames untouched.
 * @param filename the filename or path (with UNIX slash separator) to sanitize
 * @param maxFileLength the filename will be shortened to this length
 * @returns the cleaned filename
 */
export function sanitizeFilename(filename: string, maxFileLength: number): string {
    return generalizedSanitizeFilename(filename, /[^A-Za-z0-9\-._!()@/]/g, maxFileLength);
}
