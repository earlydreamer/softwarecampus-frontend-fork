import { cn } from '../../utils/cn';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> { }

const Skeleton = ({ className, ...props }: SkeletonProps) => {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-slate-200 dark:bg-slate-700", className)}
            {...props}
        />
    );
};

export default Skeleton;
