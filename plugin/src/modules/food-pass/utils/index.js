/**
 * Food Pass Utilities
 */

export const getMealType = ( dateObj ) => {
	const hours = dateObj.getHours();
	// If before 4 PM (16:00), consider it Lunch, else Dinner
	return hours < 16 ? 'Lunch' : 'Dinner';
};

export const getStatusColor = ( status ) => {
	switch ( status ) {
		case 'active':
			return '#00a32a';
		case 'expired':
			return '#d63638';
		default:
			return '#757575';
	}
};

export const getDashboardStats = ( foodPasses ) => {
	const now = new Date();
	const today = now.toISOString().split( 'T' )[ 0 ];
	const currentMonth = now.getMonth();
	const currentYear = now.getFullYear();

	const lastMonthDate = new Date( now.getFullYear(), now.getMonth() - 1, 1 );
	const lastMonth = lastMonthDate.getMonth();
	const lastMonthYear = lastMonthDate.getFullYear();

	const stats = {
		today: { lunch: 0, dinner: 0, total: 0 },
		thisMonth: { count: 0, amount: 0 },
		lastMonth: { count: 0, amount: 0 },
	};

	foodPasses.forEach( ( pass ) => {
		const passDate = new Date( pass.issue_date );
		const passMonth = passDate.getMonth();
		const passYear = passDate.getFullYear();

		// Calculate Amount
		let amount = 0;
		let mealType = 'Lunch';
		try {
			const notesData = pass.notes ? JSON.parse( pass.notes ) : {};
			if ( notesData.amount ) {
				amount = parseFloat( notesData.amount );
			} else {
				amount = ( parseInt( pass.total_meals ) || 0 ) * 90;
			}
			if ( notesData.mealType ) {
				mealType = notesData.mealType;
			}
		} catch ( e ) {
			amount = ( parseInt( pass.total_meals ) || 0 ) * 90;
		}

		const quantity = parseInt( pass.total_meals || 0 );

		// Today's Stats
		if ( pass.issue_date === today ) {
			if ( mealType === 'Lunch' ) {
				stats.today.lunch += quantity;
			}
			if ( mealType === 'Dinner' ) {
				stats.today.dinner += quantity;
			}
			stats.today.total += quantity;
		}

		// This Month's Stats
		if ( passMonth === currentMonth && passYear === currentYear ) {
			stats.thisMonth.count += quantity;
			stats.thisMonth.amount += amount;
		}

		// Last Month's Stats
		if ( passMonth === lastMonth && passYear === lastMonthYear ) {
			stats.lastMonth.count += quantity;
			stats.lastMonth.amount += amount;
		}
	} );
	return stats;
};

export const getFilteredReports = (
	foodPasses,
	startDate,
	endDate,
	filterType
) => {
	if ( ! startDate || ! endDate ) {
		return [];
	}

	const start = new Date( startDate );
	const end = new Date( endDate );
	// Set end date to end of day to include the full day
	end.setHours( 23, 59, 59, 999 );

	return foodPasses.filter( ( pass ) => {
		const passDate = new Date( pass.issue_date );
		// Date Filter
		if ( passDate < start || passDate > end ) {
			return false;
		}

		// Meal Type Filter
		if ( filterType !== 'all' ) {
			let mealType = 'Lunch';
			try {
				const notesData = pass.notes ? JSON.parse( pass.notes ) : {};
				if ( notesData.mealType ) {
					mealType = notesData.mealType;
				}
			} catch ( e ) {}

			if ( mealType.toLowerCase() !== filterType.toLowerCase() ) {
				return false;
			}
		}

		return true;
	} );
};
