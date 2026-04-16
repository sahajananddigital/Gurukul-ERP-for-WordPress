export const generateReceiptImage = ( data, type = 'food-pass' ) => {
	const canvas = document.createElement( 'canvas' );
	const ctx = canvas.getContext( '2d' );

	const width = 380;
	// Dynamic height based on content? Start tall and trim?
	// For now, let's pick a safe height.
	const height = type === 'donation' ? 800 : 600;

	canvas.width = width;
	canvas.height = height;

	// Background
	ctx.fillStyle = '#ffffff';
	ctx.fillRect( 0, 0, width, height );

	// Text Settings
	ctx.fillStyle = '#000000';
	ctx.font = 'bold 16px monospace';
	ctx.textBaseline = 'top';

	let y = 20;
	const lineHeight = 24;
	const centerX = width / 2;

	const drawCentered = ( text, localY ) => {
		ctx.textAlign = 'center';
		ctx.fillText( text, centerX, localY );
		return localY + lineHeight;
	};

	const drawLeft = ( text, localY, x = 20 ) => {
		ctx.textAlign = 'left';
		ctx.fillText( text, x, localY );
		return localY + lineHeight;
	};

	const drawDivider = ( localY ) => {
		ctx.beginPath();
		ctx.setLineDash( [ 5, 5 ] );
		ctx.moveTo( 10, localY + 10 );
		ctx.lineTo( width - 10, localY + 10 );
		ctx.stroke();
		return localY + 20;
	};

	const drawLine = ( localY ) => {
		ctx.textAlign = 'center';
		ctx.fillText( '---------------------------------', centerX, localY );
		return localY + lineHeight;
	};

	if ( type === 'food-pass' ) {
		y = drawCentered( 'Shree Swaminarayan Gurukul', y );
		y = drawLine( y );
		y = drawCentered( '🍛 FOOD PASS 🍛', y );
		y = drawLine( y );
		y += 10;

		const kvX = 20;
		const alignX = 140; // Align values after this x

		const drawField = ( label, value ) => {
			ctx.textAlign = 'left';
			ctx.fillText( label, kvX, y );
			ctx.fillText( ' : ' + value, alignX, y );
			y += lineHeight;
		};

		drawField( 'ID', data.id );
		drawField( 'Date', data.date );
		drawField( 'Time', data.time ); // User's code has time + (period), passed in data.time ideally
		drawField( 'Quantity', data.quantity );
		drawField( 'Rate', `₹${ data.rate }` );

		y = drawLine( y );

		ctx.font = 'bold 20px monospace';
		drawField( 'Total', `₹${ data.amount }` );

		y += 30;
		ctx.font = 'bold 16px monospace';
		y = drawCentered( '🙏 Jay Swaminarayan 🙏', y );
	} else if ( type === 'donation' ) {
		y = drawCentered( 'Shree Swaminarayan Gurukul', y );
		y = drawCentered( 'Ahmedabad - Nikol', y );
		y += 10;
		ctx.font = 'bold 20px monospace';
		y = drawCentered( 'DONATION', y );
		ctx.font = 'bold 16px monospace';
		y += 10;

		const kvX = 20;
		const alignX = 100;

		const drawField = ( label, value ) => {
			ctx.textAlign = 'left';
			ctx.fillText( label, kvX, y );
			ctx.fillText( ' : ' + value, alignX, y );
			y += lineHeight;
		};

		drawField( 'ID', data.id );
		if ( data.donor_id ) {
			drawField( 'User ID', data.donor_id );
		}
		drawField( 'Date', data.date );
		drawField( 'Name', data.donor_name );
		drawField( 'Amount', `₹${ data.amount }` );
		drawField( 'Phone', data.phone || '-' );
		drawField( 'Details', data.ledger || '-' ); // Ledger is mapped to "Details" in legacy? Note says "donationNote", user code says "Details: ${note}"
		// However, in our form we passed ledger to 'ledger' and note to 'notes'.
		// User legacy code: `Details: ${note || '-'}`.
		// Wait, user's legacy code has a "Note" field and a "Ledger" field.
		// In the printed text it says "Details: ${note}".
		// Let's print Note if present, otherwise Ledger? Or both?
		// Legacy code: `Details: ${note || '-'}`. It seems strict.
		// I will print Note if passed.
		if ( data.note ) {
			drawField( 'Note', data.note );
		}
		// I'll also add Ledger because it's valuable.
		drawField( 'Ledger', data.ledger );

		y += 20;
		y = drawCentered( '✻✻✻✻✻✻✻✻✻✻✻✻✻✻✻✻✻', y );
		y += 10;

		ctx.textAlign = 'left';
		ctx.fillText( 'Gurkul Activities:', 20, y );
		y += lineHeight;

		const activities = [
			'✻ Morning Evening Aarti',
			'✻ Daily Shiramani & Pooja',
			'✻ Ravi Sabha',
			'✻ Saturday Youth Sabha',
			'✻ Poonam Abhishek',
		];

		activities.forEach( ( act ) => {
			ctx.fillText( '  ' + act, 20, y );
			y += lineHeight;
		} );

		y += 20;
		y = drawCentered( '🙏 🙏 Jay Swaminarayan 🙏 🙏', y );
	}

	return canvas.toDataURL( 'image/png' );
};

export const printReceiptImage = ( imageUrl ) => {
	const win = window.open( '', '_blank', 'width=400,height=600' );
	if ( ! win ) {
		alert( 'Please allow popups to print the receipt.' );
		return;
	}

	win.document.write( `
		<html>
			<head>
				<title>Print Receipt</title>
				<style>
					body { margin: 0; padding: 0; display: flex; justify-content: center; }
					img { width: 100%; max-width: 380px; height: auto; }
					@media print {
						body { -webkit-print-color-adjust: exact; }
					}
				</style>
			</head>
			<body>
				<img src="${ imageUrl }" onload="window.print(); window.close();" />
			</body>
		</html>
	` );
	win.document.close();
};
