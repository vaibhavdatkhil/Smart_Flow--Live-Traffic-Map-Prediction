import React from 'react';
import { Phone } from 'lucide-react';

export default function FloatingActions() {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4">
      {/* Call Button */}
      <a
        href="tel:+1234567890" // Replace with actual number
        className="flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 hover:scale-110 transition-transform duration-300"
        aria-label="Call us"
      >
        <Phone className="w-5 h-5" />
      </a>
    </div>
  );
}
