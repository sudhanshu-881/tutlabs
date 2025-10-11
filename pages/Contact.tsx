import React from 'react';

const Contact: React.FC = () => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // In a real application, you would handle form submission here,
    // e.g., by sending the data to an API endpoint.
    alert('Thank you for your message! We will get back to you soon.');
    // Optionally, reset the form
    e.currentTarget.reset();
  };

  return (
    <div className="bg-white dark:bg-gray-800/50 py-12 px-4 sm:px-6 lg:px-8 rounded-lg">
      <div className="relative max-w-xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Contact Us</h2>
          <p className="mt-4 text-lg leading-6 text-gray-500 dark:text-gray-400">
            Have a question or need support? Fill out the form below and we'll get back to you as soon as possible.
          </p>
        </div>
        <div className="mt-12">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
            <div>
              <label htmlFor="first-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">First name</label>
              <div className="mt-1">
                <input type="text" name="first-name" id="first-name" autoComplete="given-name" required maxLength={50} className="py-3 px-4 block w-full shadow-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-shadow"/>
              </div>
            </div>
            <div>
              <label htmlFor="last-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last name</label>
              <div className="mt-1">
                <input type="text" name="last-name" id="last-name" autoComplete="family-name" required maxLength={50} className="py-3 px-4 block w-full shadow-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-shadow"/>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <div className="mt-1">
                <input id="email" name="email" type="email" autoComplete="email" required maxLength={100} className="py-3 px-4 block w-full shadow-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-shadow"/>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
              <div className="mt-1">
                <textarea id="message" name="message" rows={4} required maxLength={5000} className="py-3 px-4 block w-full shadow-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-shadow"></textarea>
              </div>
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/30 active:translate-y-0 active:shadow-md">
                Let's talk
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;