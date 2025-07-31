const debounce = (func, delay) => {
    let timeout; // This variable will hold the timeout ID

    // Return a new function that will be called by the event listener
    return function(...args) {
        const context = this; // Preserve the 'this' context

        // Clear the previous timeout if it exists (i.e., the function was called again before delay)
        clearTimeout(timeout);

        // Set a new timeout
        timeout = setTimeout(() => {
            // Execute the original function after the delay
            func.apply(context, args);
        }, delay);
    };
};

export default debounce;
