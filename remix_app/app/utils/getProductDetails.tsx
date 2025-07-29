export const getProductDetails = async (id: string) => {
    const response = await fetch('/api/v1/product', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id
        }),
    });
    return response.json();
}