const database = {
    /** @type {Race[]} */
    records: [],

    load: async () => {
        const response = await fetch("https://jsonplaceholder.typicode.com/posts");
        database.records = await response.json();
    },
};

export { database };
