import React from 'react';
import { useQuery } from '@tanstack/react-query';
import HeroBanner from '../components/home/HeroBanner';
import CourseSection from '../components/home/CourseSection';
import CommunitySection from '../components/home/CommunitySection';
import { fetchHomeBanners, fetchHomeCourseSections, fetchCommunityHighlights } from '../services/homeService';

const LandingPage: React.FC = () => {
    const {
        data: banners = [],
        isLoading: bannersLoading
    } = useQuery({
        queryKey: ['home', 'banners'],
        queryFn: fetchHomeBanners
    });

    const {
        data: courseSections,
        isLoading: coursesLoading
    } = useQuery({
        queryKey: ['home', 'courseSections'],
        queryFn: fetchHomeCourseSections
    });

    const {
        data: communityPosts = [],
        isLoading: communityLoading
    } = useQuery({
        queryKey: ['home', 'community'],
        queryFn: fetchCommunityHighlights
    });

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
            <div className="container mx-auto px-4 pt-6 space-y-16">
                <HeroBanner banners={banners} loading={bannersLoading} />

                <main className="space-y-20">
                    <CourseSection
                        title="재직자 베스트 과정"
                        courses={courseSections?.employeeBest ?? []}
                        loading={coursesLoading}
                        link="/lectures?target=employee"
                        targetCount={4}
                    />
                    <CourseSection
                        title="취업예정자 베스트 과정"
                        courses={courseSections?.jobSeekerBest ?? []}
                        loading={coursesLoading}
                        link="/lectures?target=student"
                        targetCount={4}
                    />
                    <CourseSection
                        title="마감 임박 과정"
                        courses={courseSections?.closingSoon ?? []}
                        loading={coursesLoading}
                        link="/lectures"
                        targetCount={4}
                    />

                    <CommunitySection posts={communityPosts} loading={communityLoading} />
                </main>
            </div>
        </div>
    );
};

export default LandingPage;
