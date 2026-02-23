console.log('arena.js loaded ✅')


let channelSlug = 'video-game-interfaces-x9glzuoklq' // The “slug” is just the end of the URL.
let myUsername = 'sophia-bae-zsvqiaw7cdm' // For linking to your profile.

// declaring constants of block media types
const KIND_LABEL = {
	IMG: 'IMAGE',
	TXT: 'TXT',
	URL: 'LINK',
	MP3: 'AUDIO',
	MP4:'VIDEO'
}


// Attribution to LLM (ChatGPT): I was trying to figure out a sorting/categorization method to help structure this as a mapping function for the different media types.

// My understanding: getKind function returns a short label used for titles on modal windows and filtering.

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
			return 'URL'
		}
		else if (embedType.includes('video')){
			return 'MP4'
		}
		
	}
	// fallback when type doesn’t match above
	return 'URL' 
}




// Attribution to LLM (ChatGPT): It suggested a “fallback ladder” to avoid missing images, especially for the thumbnails on the main page.
// My understanding: getImageUrl function returns the best available image URL for a block, or '' if none exists.
let getImageUrl = (blockData) => {

	// prefer large quality pictures for thumbnails + modals
	if (blockData.image && blockData.image.large && blockData.image.large.src_2x){
		return blockData.image.large.src_2x
	}

	// fallback to original if large size isn’t available
	if (blockData.image && blockData.image.original && blockData.image.original.url){
		return blockData.image.original.url
	}

	// when no image is found return empty
	return ''
}


// getSourceUrl returns best URL when user clicks to "equip" the block
// first tries the source url, then attachment file, then the actual Are.na block page as a fallback

let getSourceUrl = (blockData) => {
	if (blockData.source && blockData.source.url){
		return blockData.source.url
	}
	if (blockData.attachment & blockData.attachment.url){
		return blockData.attachment.url
	}
	return `https://www.are.na/block/${blockData.id}`
}








// First, let’s lay out some *functions*, starting with our basic metadata:
let placeChannelInfo = (channelData) => {
	// Target some elements in your HTML:
	let channelTitle = document.querySelector('#channel-title')
	let channelDescription = document.querySelector('#channel-description')
	let channelCount = document.querySelector('#channel-count')
	let channelLink = document.querySelector('#channel-link')
	let hudTitle = document.querySelector('#hud-title-display')
	let siTotal = document.querySelector('#si-total')

	// Then set their content/attributes to our data:
	channelTitle.innerHTML = channelData.title
	channelDescription.innerHTML = channelData.description ? channelData.description.html : ''
	channelCount.innerHTML = channelData.counts.blocks
	channelLink.href = `https://www.are.na/channel/${channelSlug}`
	hudTitle.textContent = channelData.title.toUpperCase()
	siTotal.textContent = channelData.counts.blocks
}


let blocksById = {}

// retrieve elements from html
let modal = document.querySelector('#block-modal')
let modalBody = document.querySelector('#modal-body')


// Attribution to LLM (ChatGPT): it suggested using <dialog>.showModal() and body scroll locking in the background.
// My understanding: This openModal function injects the block's HTML into the modal first, then opens the dialog window.

let openModal = (html) => {
	// insert html into modal body
	modalBody.innerHTML = html 	

	// open the <dialog> element with .showModal()
	modal.showModal() 
	
	// adding a class to the element prevents scrolling so that the window is fixed on screen.
	document.body.classList.add('modal-open') 
}


// Attribution to LLM (ChatGPT): it suggested using <dialog>.close() and removing the body scroll locking in the background.
// My understanding: This closeModal function closes the modal first, then resumes regular page scrolling.
let closeModal = () => {
	// first hide the modal
	modal.close() 

	// allow page scroll again
	document.body.classList.remove('modal-open') 
	
}


// Attribution to LLM (ChatGPT): It suggested assigning the click event with .closest() so clicks on child elements still work for the user
// My understanding: This function checks what was clicked.

if (modal) {
	modal.addEventListener('click', (event) => {
		// event.target is the exact element that's clicked on
		// .closest() -> find the nearest parent element that matches a selector and checks if the close button was clicked
		if (event.target && event.target.closest && event.target.closest('#modal-close')) {
			closeModal()
			return
		}
		// when backdrop area is clicked, close the modal
		if (event.target === modal) {
			closeModal()
		}
	})
}







// Attribution to LLM (ChatGPT): It helped propose this “build HTML string from blockData” pattern so that I could insert the necessary HTML strings into my modal window
// My understanding: buildModal function basically converts an Are.na block object into HTML to display in the modal.
let buildModal = (blockData) => {

	// Decide title text from block title, if none, show block type
	let titleText = blockData.type

	if (blockData.title){
		titleText = blockData.title
	}

	let titleHtml = `<h3>${ titleText }</h3>`



	// Description HTML -> Are.na provides description.html
	let descHtml = ''
	if (blockData.description && blockData.description.html){
		descHtml = blockData.description.html
	}
	// if description does not exist do nothing, if it does add section
	let descSect = ''
	if (descHtml){
		descSect = `<section>${ descHtml }</section>`
	}

	// External link HTML -> for if the block has a source URL
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

	// condition for both image / link separated by or operand and if they both share blockData.image
	if (blockData.type == 'Image' || blockData.type == 'Link'){

		// helper function getImageUrl()
		let imageUrl = getImageUrl(blockData) 
		let altText = ''

		if (blockData.image && blockData.image.alt_text){
			altText = blockData.image.alt_text
		}

		if (imageUrl){
			mediaHtml = `<img src="${ imageUrl }" alt="${ altText }">`
		}
		

	}

	// Are.na already provides HTML in blockData.content.html
	if (blockData.type == 'Text'){
		if (blockData.content && blockData.content.html){
			mediaHtml = `<section class='txt'>${ blockData.content.html }</section>`
		}
	}


	// using content_type to decide which HTML element to use from ATTACHMENT blocks
	if (blockData.type == 'Attachment'){
		let contentType = blockData.attachment.content_type
		
		// specifically for videos
		if (contentType.includes('video')){
			mediaHtml = `<video controls src="${ blockData.attachment.url }"></video>`
		}
		// specifically for audios
		else if (contentType.includes('audio')){
			mediaHtml = 
			`
			<section class="audio-wrap">
				<audio controls src="${ blockData.attachment.url}" playsinline>
				</audio>
			</section>
			`
		}
		// specifically for pdfs
		else if (contentType.includes('pdf')){
			mediaHtml = 
			`
			<p class="txt"> 
				<a target="_blank" href="${ blockData.attachment.url}">
					<i class="fa-solid fa-link" aria-hidden="true"></i>

				</a>
			</p>
			`
		}
		else if (contentType.includes('image')){
			mediaHtml = `<img src="${ blockData.attachment.url }" alt="">`
		}
	}

	// conditions for embedded media blocks
	// embed HTML is already provided by Are.na, but some external sites (Behance) block iframes

	if (blockData.type =='Embed'){
		if(blockData.embed && blockData.embed.html){
			mediaHtml = blockData.embed.html
		}

		// Behance-specific blocks don't display the necessary media embeds, so it shows a placeholder instead in these cases
		if (blockData.source && blockData.source.url){
			if (blockData.source.url.includes('behance.net')){
				mediaHtml = 
				`
				<p class="txt">[ EXTERNAL SITE ]</p>
				`
			}
		}
	}


	// kind label used for classification of block that is displayed on top of modal
	let kind = getKind(blockData)
	


	// adding elements to html structure for final html output
	let html =
	`

	<section class="modal-kind">
		<p>${ kind }</p>

	</section>
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

// Attribution to LLM (ChatGPT): It suggested showing  thumbnails of blocks as a render approach for a clean grid view that users can navigate throughout
// My understanding: renderBlock() function creates an <li> with a thumbnail image or placeholder text if it does not exist.
let renderBlock = (blockData) => {
	// To start, a shared ul where we’ll insert all our blocks 
	let channelBlocks = document.querySelector('#channel-blocks') 
	// store blocks by their id so modal can look it up later
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
	
	// If block has no thumbnail available, show a placeholder UI card with the block title + type
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
	
	// use data-block-id to open modal
	// data-kind is used for filtering toggles
	thumbItem = 
	`
	<li class="content" data-block-id="${ blockData.id }" data-kind="${ kind }"> 
		${ thumbMedia }
	</li> 
	`
	// And puts it into the page! 
	channelBlocks.insertAdjacentHTML('beforeend', thumbItem)


}


// Attribution to LLM (ChatGPT): It suggested using aria-pressed property + [hidden] for a toggles in the nav.
// My understanding: applyFilters reads the toggle states true/false and hides/shows blocks based on the block's data-kind.
let applyFilters = () => {
	// what kinds of data are currently on
	// maps like { IMG: true, MP3: false, ... }
	let actives = {}

	
	let toggle = document.querySelectorAll('.filter-toggle')

	toggle.forEach((button) => {
		// what category this toggle controls
		let kind = button.getAttribute('data-kind')
		// this is the current state
		let on = button.getAttribute('aria-pressed') == 'true'
		actives[kind] = on
	})

	let blockContent = document.querySelectorAll('#channel-blocks .content')

	blockContent.forEach((item) => {
		let kind = item.getAttribute('data-kind')
		let show = actives[kind]
		// [hidden] is a native HTML way to hide elements
		item.hidden = !show 
	})


}

// setting up the actual filters for each respective block
// Attribution to LLM (ChatGPT): It suggested attaching click handlers once and calling applyFilters after the actual toggles change.
// My understanding: setFilters() manipulates the aria-pressed property through button clicks, then re-filters blocks accordingly
let setFilters = () => {
	let toggle = document.querySelectorAll('.filter-toggle')

	toggle.forEach((button) => {
		button.addEventListener('click', () => {
			let current = button.getAttribute('aria-pressed') == 'true'
			button.setAttribute('aria-pressed', current ? 'false' : 'true')

			applyFilters()
		})
	})

	// run the helper function once
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

	// implementation with guidance from Claude
	// setFilters() applies filtering logic to the displayed blocks and updates the navigation UI with the current total count.

	setFilters()

	// The nav element is selected from the DOM. If it exists, a custom data attribute (data-count) is set to the total number of items returned from the Are.na API (json.data.length). 
	// This allows the count to be accessed in CSS (via attr()) or JavaScript for display, filtering, or interface feedback.A
	let nav = document.querySelector('nav')

	// This pattern separates data from presentation by storing state in a semantic data attribute rather than hardcoding values.
	if (nav) nav.setAttribute('data-count', json.data.length)

	// Attribution to LLM (ChatGPT): It suggested click event on #channel-blocks for dynamic <li> items which are the Are.na content blocks themselves.
	// My understanding: clicking on any thumbnail finds its nearest li[data-block-id], then opens that block in the modal.
	let channelBlocks = document.querySelector('#channel-blocks')

	// to open the blocks with click
	// to find the clicked <li> element with the data block id, even if you click the img inside

	channelBlocks.addEventListener('click', (event) => {


	
		let clicked = event.target.closest('li[data-block-id]')
		if (!clicked) return

		let blockId = clicked.getAttribute('data-block-id') 		// to get the id string from the attribute


		let blockData = blocksById[blockId] 		// look up + search for the saved block data

		if (!blockData) return

		// want to actually build the html content in modal and open it
		// use buildModal helper function implemented earlier
		let modalHtml = buildModal(blockData)
		openModal(modalHtml)
	})
})
