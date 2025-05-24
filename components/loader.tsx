const Loader = () => {
  return (
    <div 
      id="loader" 
      className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
      aria-live="assertive"
    >
      <div className="flex flex-col items-center">
        <div 
          className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-t-transparent"
          role="status"
        >
          <span className="sr-only">Loading...</span>
        </div>
        <p className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-300">
          Loading...
        </p>
      </div>
    </div>
  );
};

export default Loader;