import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';

import { Button } from '../Button';
import styles from './pagination.module.css';

interface PaginationProps {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    onPageChange: (page: number) => void;
}

export function Pagination({ totalItems, itemsPerPage, currentPage, onPageChange }: PaginationProps) {
    if (totalItems <= itemsPerPage) {
        return;
    }

    const maxPages = Math.ceil(totalItems / itemsPerPage);

    return (
        <div className={styles.pagination}>
            <Button color="primary" onClick={() => onPageChange(currentPage - 1)} label={<ChevronLeftIcon />} disabled={currentPage === 1} />
            {currentPage > 2 && <Button color="primary" label="1" onClick={() => onPageChange(1)} />}
            {currentPage > 3 && <Button color="primary" label="..." />}
            {currentPage > 1 && <Button color="primary" onClick={() => onPageChange(currentPage - 1)} label={currentPage - 1} />}
            <Button color="primary" variant="contained" label={currentPage} />
            {currentPage + 1 <= maxPages && <Button color="primary" onClick={() => onPageChange(currentPage + 1)} label={currentPage + 1} />}
            {currentPage + 3 <= maxPages && <Button color="primary" label="..." />}
            {currentPage + 2 <= maxPages && <Button color="primary" onClick={() => onPageChange(maxPages)} label={maxPages} />}
            <Button color="primary" onClick={() => onPageChange(currentPage + 1)} label={<ChevronRightIcon />} disabled={currentPage === maxPages} />
        </div>
    );
}
