import { Github, Twitter, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";

export default function Footer() {
  return (
    <footer className="w-full border-t bg-white">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">About Dropship Platform</h4>
            <p className="text-sm text-gray-600">
              A comprehensive dropshipping solution helping merchants discover,
              manage, and sync products from multiple suppliers to their
              e-commerce stores.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link to="/about" className="hover:text-gray-900">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/features" className="hover:text-gray-900">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-gray-900">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/contact-us" className="hover:text-gray-900">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link to="/blog" className="hover:text-gray-900">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/documentation" className="hover:text-gray-900">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-gray-900">
                  Support
                </Link>
              </li>
              <li>
                <Link to="/api" className="hover:text-gray-900">
                  API
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Connect</h4>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                >
                  <Github className="h-5 w-5" aria-label="GitHub"/>
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600">
          © {new Date().getFullYear()} Dropship Platform. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
