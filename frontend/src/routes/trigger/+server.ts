import { API_ENDPOINTS } from '$lib/config';
import { json } from '@sveltejs/kit';

export const GET = async () => {
	try {
		const response = await fetch(API_ENDPOINTS.TRIGGER);
		const text = await response.text();

		if (response.ok) {
			return json(
				{
					success: true,
					message: text || 'Sync triggered successfully',
				},
				{ status: 200 }
			);
		} else {
			return json(
				{
					success: false,
					error: text || response.statusText,
				},
				{ status: response.status }
			);
		}
	} catch (error) {
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
};
