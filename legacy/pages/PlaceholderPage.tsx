import React from 'react';
import { Link } from 'react-router-dom';

interface PlaceholderPageProps {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, description, ctaLabel = '메인으로 돌아가기', ctaHref = '/' }) => (
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center space-y-6">
    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{title}</h1>
    <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
    <Link
      to={ctaHref}
      className="inline-flex items-center px-5 py-2.5 rounded-md bg-primary text-white text-sm font-semibold hover:bg-opacity-90 transition"
    >
      {ctaLabel}
    </Link>
  </div>
);

export default PlaceholderPage;
