export const getProducts = async () => {
    const response = await fetch('/api/v1/products', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        }),
    });
    return response.json();
}