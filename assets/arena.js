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

// new function for nav toggles
let getKind = (blockData) => {
	if (blockData.type == 'Image'){
		return 'IMG'
	}
	else if (blockData.type == 'Text'){
		return 'TXT'
	}
	else if (blockData.type == 'Link'){
		return 'URL'
	}
	else if (blockData.type == 'Attachment'){
		let contentType = blockData.attachment.content_type

		if (contentType.includes('audio')){
			return 'MP3'
		}
		else if (contentType.includes('video')){
			return 'MP4'
		}
		else if (contentType.includes('pdf')){
			return 'URL'
		}
	}
	else if (blockData.type == 'Embed'){
		let embedType = blockData.embed.type

		if (embedType.includes('rich')){
			return 'MP3'
		}
		else if (embedType.includes('video')){
			return 'MP4'
		}
		
	}
	return 'URL'
}

// new function for modal blocks
let buildModal = (blockData) => {

	//for pulling in title
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
	// To start, a shared ul where we’ll insert all our blocks 
	let channelBlocks = document.querySelector('#channel-blocks') 
	// store blocks by their id 
	blocksById[blockData.id] = blockData 
	// want to only show thumbnail media initially 
	
	let thumbnail = '' 
	let thumbMedia = ''
	let kind = getKind(blockData)
	

	// block has thumbnail image
	if (blockData.image && blockData.image.large && blockData.image.large.src_2x){ 
		thumbnail = blockData.image.large.src_2x 

		thumbMedia =
		`
		<img src="${ thumbnail }" >
		`
	} 
	
	// if block has no thumbnail image
	else {
		let blockTitle = ''

		if (blockData.title){
			blockTitle = blockData.title
		}
		else {
			blockTitle = blockData.type
		}

		thumbMedia =
		`
		<section class="thumb-placeholder">
    		<p>${ blockTitle }</p>
  		</section>
		`
	}
	
	thumbItem = 
	`
	<li class="content" data-block-id="${ blockData.id }" data-kind="${ kind }"> 
		${ thumbMedia }
	</li> 
	`
	// And puts it into the page! 
	channelBlocks.insertAdjacentHTML('beforeend', thumbItem)


}

// creating filtering / toggles for the navigation menu
// function for applying the actual filters
let applyFilters = () => {
	// what kinds of data are currently on
	let actives = {}

	let toggle = document.querySelectorAll('.filter-toggle')

	toggle.forEach((button) => {
		let kind = button.getAttribute('data-kind')
		let on = button.getAttribute('aria-pressed') == 'true'
		actives[kind] = on
	})

	let blockContent = document.querySelectorAll('#channel-blocks .content')

	blockContent.forEach((item) => {
		let kind = item.getAttribute('data-kind')
		let show = actives[kind]
		item.hidden = !show
	})


}

// setting up the actual filters for each respective block
let setFilters = () => {
	let toggle = document.querySelectorAll('.filter-toggle')

	toggle.forEach((button) => {
		button.addEventListener('click', () => {
			let current = button.getAttribute('aria-pressed') == 'true'
			button.setAttribute('aria-pressed', current ? 'false' : 'true')

			applyFilters()
		})
	})
	applyFilters()
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

	setFilters()

	let channelBlocks = document.querySelector('#channel-blocks')

	// to open the blocks with click
	channelBlocks.addEventListener('click', (event) => {

		// to find the clicked <li> element with the data block id
		let clicked = event.target.closest('li[data-block-id]')
		if (!clicked) return

		// to get the id string from the attribute
		let blockId = clicked.getAttribute('data-block-id')

		// look up + search for the saved block data
		let blockData = blocksById[blockId]
		if (!blockData) return

		// want to actually build the modal and open it
		// use buildModal function implemented earlier
		let modalHtml = buildModal(blockData)
		openModal(modalHtml)
	})
})
