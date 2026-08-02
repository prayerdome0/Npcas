import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { BookOpen, Users, Award, GraduationCap } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-primary-100 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Learn Without Limits with
            <span className="text-primary-600"> Sims Academy</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join thousands of students learning from expert tutors. Get certified,
            advance your career, and achieve your goals with our comprehensive online courses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/courses">
              <Button size="lg">Browse Courses</Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="outline" size="lg">Get Started Free</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Courses</h3>
              <p className="text-gray-600">
                Learn from expert tutors with comprehensive course materials and structured learning paths.
              </p>
            </div>
            <div className="text-center p-8 bg-white rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Certification</h3>
              <p className="text-gray-600">
                Earn certificates upon course completion to showcase your new skills and knowledge.
              </p>
            </div>
            <div className="text-center p-8 bg-white rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Flexible Learning</h3>
              <p className="text-gray-600">
                Learn at your own pace with self-paced courses and lifetime access to materials.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join Sims Academy today and take the first step towards achieving your educational goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg">Get Started Free</Button>
            </Link>
            <Link href="/courses">
              <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-gray-900">
                Browse Courses
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
