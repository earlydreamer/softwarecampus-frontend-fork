import { Calendar, MapPin, Building } from 'lucide-react';
import type { Course } from '../../types';

interface CourseDetailHeaderProps {
    course: Course;
    headerBackgroundImage: string;
}

const CourseDetailHeader = ({ course, headerBackgroundImage }: CourseDetailHeaderProps) => {
    return (
        <div className="bg-slate-900 text-white py-12 lg:py-20 relative overflow-hidden">
            <div 
                className="absolute inset-0 opacity-40 bg-cover bg-center"
                style={{ backgroundImage: `url('${headerBackgroundImage}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full bg-primary-600/20 text-primary-300 text-sm font-medium border border-primary-500/30">
                        {course.category.name}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/10 text-slate-300 text-sm font-medium backdrop-blur-sm">
                        {course.format}
                    </span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-6 leading-tight">{course.name}</h1>
                <div className="flex flex-wrap items-center gap-6 text-slate-300 text-sm lg:text-base">
                    <div className="flex items-center gap-2">
                        <Building className="w-5 h-5 text-primary-400" />
                        <span>{course.academy.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary-400" />
                        <span>{course.location || course.academy.address || '지역 미정'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary-400" />
                        <span>
                            {course.courseStart && course.courseEnd
                                ? `${course.courseStart} ~ ${course.courseEnd}`
                                : '교육 기간 미정'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailHeader;
