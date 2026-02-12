console.log('arena.js loaded ✅')


let channelSlug = 'video-game-interfaces-x9glzuoklq' // The “slug” is just the end of the URL.
let myUsername = 'sophia-bae-zsvqiaw7cdm' // For linking to your profile.


// First, let’s lay out some *functions*, starting with our basic metadata:
let placeChannelInfo = (channelData) => {
	// Target some elements in your HTML:
	let channelTitle = document.querySelector('#channel-title')
	let channelDescription = document.querySelector('#channel-description')
	let channelCount = document.querySelector('#channel-count')
	let channelLink = document.querySelector('#channel-link')

	// Then set their content/attributes to our data:
	channelTitle.innerHTML = channelData.title
	channelDescription.innerHTML = channelData.description ? channelData.description.html : ''
	channelCount.innerHTML = channelData.counts.blocks
	channelLink.href = `https://www.are.na/channel/${channelSlug}`
}


let blocksById = {}

// retrieve elements from html
let modal = document.querySelector('#block-modal')
let modalBody = document.querySelector('#modal-body')
let modalClose = document.querySelector('#modal-close')

// function to open the modal window and show html content
let openModal = (html) => {
	// insert html into modal body
	modalBody.innerHTML = html
	// show dialog
	modal.showModal()
}


// function to close the modal window
let closeModal = () => {
	// first hide the modal
	modal.close()
	// remove existing old content so block is empty for next open
	modalBody.innerHTML = ''
}


// when close button (x) is clicked, close modal
if (modalClose) {
	modalClose.addEventListener('click', closeModal)
}

// when backdrop area is clicked, close modal
if (modal){
	modal.addEventListener('click', (event) => {
		// === is a strict equality comparison of both value and data type
		if (event.target === modal) {
			closeModal()
		}
	})
}


// new function for modal blocks
let buildModal = (blockData) => {
	let titleText = blockData.type

	if (blockData.title){
		titleText = blockData.title
	}

	let titleHtml = `<h3>${ titleText }</h3>`

	// for descriptions of blocks in modal
	let descHtml = ''
	if (blockData.description && blockData.description.html){
		descHtml = blockData.description.html
	}
	// if description does not exist do nothing, if it does add
	let descSect = ''
	if (descHtml){
		descSect = `<section>${ descHtml }</section>`
	}

	// for links of blocks in modal
	let linkHtml = ''
	if (blockData.source && blockData.source.url){
		linkHtml = 
		`
		<a target="_blank" href="${ blockData.source.url}">
			<i class="fa-solid fa-link" aria-hidden="true"></i>
		</a>
		`
	}
	
	// MEDIA
	// need media to change depending on block type
	let mediaHtml = ''

	// condition for both image / link separated by or operand
	if (blockData.type == 'Image' || blockData.type == 'Link'){
		// can apply this condition to both image and link types because they both use .image
		if (blockData.image && blockData.image.large && blockData.image.large.src_2x){

			// making sure if block has any alt text
			let altText = ''
			if (blockData.image.alt_text){
				altText = blockData.image.alt_text
			}

			mediaHtml = `<img src="${ blockData.image.large.src_2x }" alt="${ altText}">`
		}

	}

	// condition for text blocks
	if (blockData.type == 'Text'){
		if (blockData.content && blockData.content.html){
			mediaHtml = `<section class='txt'>${ blockData.content.html }</section>`
		}
	}


	// condition for attachment blocks
	if (blockData.type == 'Attachment'){
		let contentType = blockData.attachment.content_type
		
		// specifically for videos
		if (contentType.includes('video')){
			mediaHtml = `<video controls src="${ blockData.attachment.url}"></video>`
		}

		// specifically for audios
		if (contentType.includes('audio')){
			mediaHtml = `<audio controls src="${ blockData.attachment.url}"></audio>`
		}

		// specifically for pdfs
		if (contentType.includes('pdf')){
			mediaHtml = 
			`
			<p class="txt"> 
				<a target="_blank" href="${ blockData.attachment.url}">
					<i class="fa-solid fa-link" aria-hidden="true"></i>

				</a>
			</p>
			`
		}
	}

	// conditions for embedded media blocks
	if (blockData.type =='Embed'){
		if(blockData.embed && blockData.embed.html){
			mediaHtml = blockData.embed.html
		}
	}

	// adding elements to html structure
	let html =
	`
	<header>
		${ titleHtml}
		${ linkHtml}
	</header>

	<figure>
		${ mediaHtml}
	</figure>

	<figcaption>
		${ descSect}
	</figcaption>
	`

	return html

}





// Then our big function for specific-block-type rendering:
let renderBlock = (blockData) => {
	// To start, a shared `ul` where we’ll insert all our blocks
	let channelBlocks = document.querySelector('#channel-blocks')

	// store blocks by their id
	blocksById[blockData.id] = blockData

	// Links!
	if (blockData.type == 'Link') {
		// Declares a “template literal” of the dynamic HTML we want.


		// ${...} -> evaluate JS and insert result here
			// blockData.title ? ... : ... -> ternary operator
				// if blockData.title exists, insert html
				// if not, insert empty string ''


		let titleHtml = ''
		let linkHtml = ''
		let descHtml = ''

		// if there is a title, insert title as h3 string
		if (blockData.title) {
			titleHtml = `<h3>${ blockData.title }</h3>`
		}


		// first checks if blockData.source exists
		// second checks if it has .url
		// if true, then use and insert html
		if (blockData.source && blockData.source.url){
			linkHtml = 
			`
			<a target="_blank" href="${ blockData.source.url}">
				<i class="fa-solid fa-link" aria-hidden="true"></i>
			</a>
			`
		}

		// first checks if blockData.description exists
		// second checks if it has .html
		// if true, then use and insert html
		if (blockData.description && blockData.description.html){
			descHtml = blockData.description.html
		}

		// variable will store a string
		// figure creates container for any media
		// picture allows responsive images
		let linkItem =
			`
			<li class="content">
				${ titleHtml }

				<figure>
					<picture>
						<source media="(width < 500px)" srcset="${ blockData.image.small.src_2x }">
						<source media="(width < 1000px)" srcset="${ blockData.image.medium.src_2x }">
						<img alt="${ blockData.image.alt_text}" src="${ blockData.image.large.src_2x }">
					</picture>

					<span class="link-icon">
						${ linkHtml }

					</span>
					<figcaption>
						${ descHtml}
					</figcaption>
				</figure>
			</li>
			`

		// And puts it into the page!
		channelBlocks.insertAdjacentHTML('beforeend', linkItem)

		// More on template literals:
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
	}

	// Images!
	else if (blockData.type == 'Image') {
		// …up to you!
		// create image variable


		// declaring necessary variables
		let titleHtml = ''
		let linkHtml = ''
		let altText = ''


		// if the block has title, insert as html
		if (blockData.title) {
			titleHtml = `<h3>${ blockData.title}</h3>`
		}

		// if img alt text exists, add as html
		if (blockData.image.alt_text) {
			altText = blockData.image.alt_text
		}

		// if source url exists, add external link with link icon
		if (blockData.source && blockData.source.url) {
			linkHtml =
			`
			<a target="_blank" href="${ blockData.source.url}">
				<i class="fa-solid fa-link" aria-hidden="true"></i>
			</a>
			`
		}



		let imageItem = 

			// before
				// ${ blockData.title ? `<h3>${ blockData.title }</h3>` : '' }
				// template literal -> multi-line string (Used AI tool, ChatGPT, to further break down and understand semantics of the condition)
				// ${...} -> evaluate JS and insert result here
				// blockData.title ? ... : ... -> ternary operator
					// if blockData.title exists, insert html
					// if not, insert empty string ''

				// blockData.source && blockData.source.url -> if blockData exists and has URL, expression is true
				// ? -> then
				// : '' -> else, if no source URL, insert ''
				// src="${ blockData.image.large.src_2x }"
					// large retina image URL
				// alt="${ blockData.image.alt_text || '' }">
					// || '' -> if alt_text is missing, use an empty string

			// update
				// simplify logic with variables created prior

			
			`
			<li class="content">
				${ titleHtml }

				<img 
					src="${ blockData.image.large.src_2x }"
					alt="${ altText }">

				<span class="link-icon">
					${ linkHtml }

				</span>
				
			</li>
			`

		channelBlocks.insertAdjacentHTML('beforeend', imageItem)


	}

	// Text!
	else if (blockData.type == 'Text') {
		// …up to you!
		
		// Content prioritization logic.
		// += clarified meaning of string concatenation through ChatGPT

		
		let bodyHtml = ''
		let descHtml = ''

		// first checks if blockData.content exists
		// second checks if it has .html
		// if true, then use
		if (blockData.content && blockData.content.html){
			bodyHtml = blockData.content.html
		}

		// first checks if blockData.description exists
		// second checks if it has .html
		// if true, then use

		if (blockData.description && blockData.description.html){
			descHtml = blockData.description.html
		}

		// create start of text block
		let textItem = '<li class="content">'

		// if the block has a title, add the title as string
		// += appends string
		if (blockData.title) {
			textItem += `<h3>${ blockData.title}</h3>`
		}

		// if main text content exists, add the text as string
		// += appends string
		if (bodyHtml) {
			textItem += `<p class="txt">${ bodyHtml }</p>`
		}

		// if desc text content exists, add the text as string
		// += appends string
		if (descHtml) {
			textItem += `<p class="desc-txt">${ descHtml }</p>`
		}

		// close out the html element list
		textItem += '</li>'


		channelBlocks.insertAdjacentHTML('beforeend', textItem)
	}

	// Uploaded (not linked) media…
	else if (blockData.type == 'Attachment') {
		let contentType = blockData.attachment.content_type // Save us some repetition.
		let titleHtml = ''
		let videoItem = ''
		let pdfItem = ''
		let audioItem = ''

		// if block has a title then insert as html element
		if (blockData.title) {
			titleHtml = `<h3>${ blockData.title }</h3>`
		}

		// Uploaded videos!
		if (contentType.includes('video')) {
			// …still up to you, but we’ll give you the `video` element:
			let videoItem =
				`
				<li class="content">
					${ titleHtml }
					<video controls src="${ blockData.attachment.url }"></video>
				</li>
				`

			channelBlocks.insertAdjacentHTML('beforeend', videoItem)

			// More on `video`, like the `autoplay` attribute:
			// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video
		}

		// Uploaded PDFs!
		else if (contentType.includes('pdf')) {
			// …up to you!

			// if NO title, just return file type as string
			if (!titleHtml){
				titleHtml = `<h3>PDF</h3>`
			}

			let pdfItem =
			`
			<li class="content">
				${ titleHtml} 
			

				<p class="txt">
					<a target="_blank" href="${ blockData.attachment.url}">
						<i class="fa-solid fa-link" aria-hidden="true"></i>
					</a>
				</p>
			</li>
			`

			channelBlocks.insertAdjacentHTML('beforeend', pdfItem)
		}

		// Uploaded audio!
		else if (contentType.includes('audio')) {

			// if NO title, just return file type as string
			if (!titleHtml){
				titleHtml = `<h3>MP3</h3>`
			}
			// …still up to you, but here’s an `audio` element:
			let audioItem =
				`
				<li class="content">
					${ blockData.title ? `<h3>${ blockData.title}</h3>` : `<h3>Audio</h3>`}
					
					<audio controls src="${ blockData.attachment.url }"></audio>
				</li>
				`

			channelBlocks.insertAdjacentHTML('beforeend', audioItem)

			// More on`audio`:
			// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio
		}
	}

	// Linked (embedded) media…
	else if (blockData.type == 'Embed') {
		let embedType = blockData.embed.type
		let titleHtml = ''
		let descHtml = ''
		let embedHtml = ''
		let linkedVideoItem = ''
		let linkedAudioItem = ''


		// if title exists
		if (blockData.title){
			titleHtml = `<h3>${ blockData.title}</h3>`
		}

		// if block has description, insert html content within variable
		if (blockData.description && blockData.description.html){
			descHtml = blockData.description.html
		}

		// if block has embed html, insert html content within variable
		if (blockData.embed && blockData.embed.html){
			embedHtml = blockData.embed.html
		}



		// Linked video!
		if (embedType.includes('video')) {


			// targeting the title if it does not exist, replace with media type
			if (!titleHtml){
				titleHtml = `<h3>MP4</h3>`
			}
			// …still up to you, but here’s an example `iframe` element:
			let linkedVideoItem =
				`
				<li class="content">
					${ titleHtml }
					${ embedHtml }
					${ descHtml }

				</li>
				`

			channelBlocks.insertAdjacentHTML('beforeend', linkedVideoItem)

			// More on `iframe`:
			// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe
		}

		// Linked audio!
		else if (embedType.includes('rich')) {
			// …up to you!

			// targeting the title if it does not exist, replace with media type
			if (!titleHtml){
				titleHtml = `<h3>MP3</h3>`
			}

			let linkedAudioItem =
			`
			<li class="content">
				${ titleHtml }
				${ embedHtml }
				${ descHtml }

			</li>
			`

			channelBlocks.insertAdjacentHTML('beforeend', linkedAudioItem)
		}
	}
}



// A function to display the owner/collaborator info:

// inside address tag -> <img src="${ userData.avatar }">
let renderUser = (userData) => {
	let channelUsers = document.querySelector('#channel-users') // Container.

	// Defensive guard clause (pattern discussed with AI assistance, ChatGPT)
	// prevents runtime errors if expected DOM containers are missing.
	// to guard renderUser function from crashing
	if (!channelUsers) return


	let userAddress =
		`
		<address>
			<h3>${ userData.name }</h3>
			<p><a href="https://are.na/${ userData.slug }">Are.na profile ↗</a></p>
		</address>
		`
		

	channelUsers.insertAdjacentHTML('beforeend', userAddress)
}




// Finally, a helper function to fetch data from the API, then run a callback function with it:
let fetchJson = (url, callback) => {
	fetch(url, { cache: 'no-store' })
		.then((response) => response.json())
		.then((json) => callback(json))
}

// More on `fetch`:
// https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch



// Now that we have said all the things we *can* do, go get the channel data:
fetchJson(`https://api.are.na/v3/channels/${channelSlug}`, (json) => {
	console.log(json) // Always good to check your response!

	placeChannelInfo(json) // Pass all the data to the first function, above.


	renderUser(json.owner) // Pass just the nested object `.owner`.
})

// Get your info to put with the owner's:
fetchJson(`https://api.are.na/v3/users/${myUsername}/`, (json) => {
	console.log(json) // See what we get back.

	renderUser(json) // Pass this to the same function, no nesting.
})

// And the data for the blocks:
fetchJson(`https://api.are.na/v3/channels/${channelSlug}/contents?per=100&sort=position_desc`, (json) => {
	console.log(json) // See what we get back.

	// Loop through the nested `.data` array (list).
	json.data.forEach((blockData) => {
		// console.log(blockData) // The data for a single block.

		renderBlock(blockData) // Pass the single block’s data to the render function.
	})
})
