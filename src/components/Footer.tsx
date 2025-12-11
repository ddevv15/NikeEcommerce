import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-dark-900 text-light-100 font-jost pt-16 pb-8">
      <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {/* Column 1: Links */}
          <div className="flex flex-col gap-4">
            <h4 className="text-body-medium font-bold text-light-100 uppercase tracking-wider">
              Resources
            </h4>
            <div className="flex flex-col gap-3 text-caption text-dark-500">
              <Link href="#" className="hover:text-light-100 transition-colors">
                Gift Cards
              </Link>
              <Link href="#" className="hover:text-light-100 transition-colors">
                Find a Store
              </Link>
              <Link href="#" className="hover:text-light-100 transition-colors">
                Become a Member
              </Link>
              <Link href="#" className="hover:text-light-100 transition-colors">
                Site Feedback
              </Link>
            </div>
          </div>

          {/* Column 2: Help */}
          <div className="flex flex-col gap-4">
            <h4 className="text-body-medium font-bold text-light-100 uppercase tracking-wider">
              Help
            </h4>
            <div className="flex flex-col gap-3 text-caption text-dark-500">
              <Link href="#" className="hover:text-light-100 transition-colors">
                Get Help
              </Link>
              <Link href="#" className="hover:text-light-100 transition-colors">
                Order Status
              </Link>
              <Link href="#" className="hover:text-light-100 transition-colors">
                Shipping and Delivery
              </Link>
              <Link href="#" className="hover:text-light-100 transition-colors">
                Returns
              </Link>
              <Link href="#" className="hover:text-light-100 transition-colors">
                Payment Options
              </Link>
            </div>
          </div>

          {/* Column 3: Company */}
          <div className="flex flex-col gap-4">
            <h4 className="text-body-medium font-bold text-light-100 uppercase tracking-wider">
              Company
            </h4>
            <div className="flex flex-col gap-3 text-caption text-dark-500">
              <Link href="#" className="hover:text-light-100 transition-colors">
                About Nike
              </Link>
              <Link href="#" className="hover:text-light-100 transition-colors">
                News
              </Link>
              <Link href="#" className="hover:text-light-100 transition-colors">
                Careers
              </Link>
              <Link href="#" className="hover:text-light-100 transition-colors">
                Investors
              </Link>
              <Link href="#" className="hover:text-light-100 transition-colors">
                Sustainability
              </Link>
            </div>
          </div>

          {/* Column 4: Social */}
          <div className="flex items-start gap-4 lg:justify-end">
            <Link href="#" className="bg-dark-700 p-2 rounded-full hover:bg-light-100 hover:text-dark-900 transition-colors">
                <Image src="/x.svg" alt="X" width={20} height={20} className="invert" />
            </Link>
            <Link href="#" className="bg-dark-700 p-2 rounded-full hover:bg-light-100 hover:text-dark-900 transition-colors">
                <Image src="/facebook.svg" alt="Facebook" width={20} height={20} className="invert" />
            </Link>
            <Link href="#" className="bg-dark-700 p-2 rounded-full hover:bg-light-100 hover:text-dark-900 transition-colors">
                <Image src="/instagram.svg" alt="Instagram" width={20} height={20} className="invert" />
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-footnote text-dark-500 pt-8 border-t border-dark-700">
            <div className="flex items-center gap-2">
                <Image src="/globe.svg" alt="Location" width={16} height={16} className="opacity-50" />
                <span className="text-light-100">India</span>
                <span className="ml-2">© 2025 Nike, Inc. All Rights Reserved</span>
            </div>
            <div className="flex flex-wrap gap-6 justify-center">
                <Link href="#" className="hover:text-light-100">Guides</Link>
                <Link href="#" className="hover:text-light-100">Terms of Sale</Link>
                <Link href="#" className="hover:text-light-100">Terms of Use</Link>
                <Link href="#" className="hover:text-light-100">Nike Privacy Policy</Link>
            </div>
        </div>
      </div>
    </footer>
  );
}
