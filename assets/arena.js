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

let blocksById = {}
// variable for how many blocks user has clicked on
let scanned = 0
let selectedBlock = null


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






// create a function that updates how many blocks the user has "scanned", or viewed, so far
let updateScanned = () => {
	let display = scanned.toString().padStart(3, '0')

	document.querySelector('#h-scan').textContent = display
	document.querySelector('#si-scanned').textContent = display

}




// create a function to show a toast message -> small mini notification that shows temporarily
// Attribution to LLM (ChatGPT): It suggested using a toast message like how some video games use, specifically helping me with the timeout.
// My understanding: 
// clearTimeout() helps to cancel any previously schedules animation. 
// setTimeout() creates a new timer and has duration of 2200 or 2.2 seconds, also removing the class name that was previously added

let showToast = (msg) => {
	let toast = document.querySelector('toast')

	toast.textContent = msg
	toast.classList.add('show')

	clearTimeout(toast._timer)
	toast._timer = setTimeout(() => toast.classList.remove('show'), 2200)
}




// Then our big function for specific-block-type rendering:

// Attribution to LLM (ChatGPT): It suggested showing  thumbnails of blocks as a render approach for a clean grid view that users can navigate throughout
// My understanding: renderBlock() function creates an <li> with a thumbnail image or placeholder text if it does not exist.
let renderBlock = (blockData) => {
	// To start, a shared ul where we’ll insert all our blocks 
	let channelBlocks = document.querySelector('#channel-blocks') 
	let kind = getKind(blockData)
	// store blocks by their id so modal can look it up later
	blocksById[blockData.id] = blockData 
	// want to only show thumbnail media initially 
	

	let imageUrl = getImageUrl(blockData)
	let thumbnail = '' 
	let thumbItem = '' 
	

	// block has thumbnail image
	if (imageURL){ 
		thumbnail = `<img src="${imageUrl}" alt=""`
	} else {
		thumbnail = 
		`
			<section class="thumb-placeholder">
				<p>${blockData.title || blockData.type}</p>
			</section>
		`
	}
	
	
	
	// use data-block-id to open modal
	// data-kind is used for filtering toggles
	thumbItem = 
	`
	<li class="content" data-block-id="${ blockData.id }" data-kind="${ kind }"> 
		${ thumbnail }
	</li> 
	`
	// And puts it into the page! 
	channelBlocks.insertAdjacentHTML('beforeend', thumbItem)


}




// Attribution to LLM (Claude AI): It suggested a structure for a block's details on the right panel, as I wanted to recreate an inventory screen like from the video game RAGE
// My understanding: showDetail() fills in the right hand panel with a block's details once a user clicks on one

let showDetail = (block, index) => {
	let kind = getKind(block)

	let dateAdded = '-'
	if (block.created_at){
		dateAdded = new Date(block.created_at).toLocaleDateString('en-US', {
			year: 'numeric',
			month:'short',
			day:'numeric'
		})
	}


	let descHtml = ''

	if (block.description && block.description.html){
		descHtml = block.description.html
	} else if (block.content && block.content.html) {
		descHtml = block.content.html
	}


	// right panel switches when user clicks on block
	document.querySelector('#state-info').classList.add('gone')
	document.querySelector('#state-detail').classList.add('show')


	// for the blocks labels and titles
	let label = KIND_LABEL[kind] || kind
	document.querySelector('#detail-header-label').textContent = label
	document.querySelector('#sd-cat').textContent = label
	document.querySelector('#sd-name').textContent = block.title || block.type




	// for the blocks description
	let sdDesc = document.querySelector('#sd-desc')
	if (block.source && block.source.url) {
		sdDesc.innerHtml = 
		`
		<a class="sd-link" href="${block.source.url}" target="_blank" rel="noopener">
			<i class="fa-solid fa-link"></i>
			<span>${block.source.url}</span>
		</a>
		${descHtml}
		`
	} else {
		sdDesc.innerHtml = descHtml
	}




	let previewHtml = ''
	const imageUrl = getImageUrl(block)

	if (imageUrl) {
		previewHtml =
		`
		<img src="${imageUrl}" alt="${block.title || ''}" class="sd-preview-img">
		`



	} else if (block.type === 'Attachment' && block.attachment){
		let contentType = block.attachment.content_type || ''

		if (contentType.includes('video')){
			previewHtml = 
			`
			<video controls src="${block.attachment.url}" style="width:100%; display:block;"></video>
			`
		} else if (contentType.includes('audio')){
			previewHtml = 
			`
			<audio controls src="${block.attachment.url}" style="width:100%;"></audio>
			`
		}

	
	} else if (block.type === 'Embed' && block.embed && block.embed.html){
		let isBehance = false

		if (block.source && block.source.url && block.source.url.includes('behance.net')){
			isBehance = true
		}

		if (!isBehance){
			previewHtml =
			`
			<section class="sd-embed-wrap">
				${block.embed.html}
			</section>
			`
		}
	}


	let previewSect = previewHtml
	if (previewHtml){
		previewSect =
		`
		<section class="sd-preview">${previewHtml}</section>
		`
	}else {
		previewSect = ''
	}

	document.querySelector('#sd-stats').innerHTML =

		`
		${previewSect}
		<section class="sd-stat-row">
			<span class="sd-stat-k">TYPE</span>
			<span class="sd-stat-v">${kind}</span>
		</section>
		<section class="sd-stat-row">
			<span class="sd-stat-k">ADDED</span>
			<span class="sd-stat-v">${dateAdded}</span>
		</section>
		<section class="sd-stat-row">
			<span class="sd-stat-k">INDEX</span>

			<span class="sd-stat-v">#${String(index + 1).padStart(3, '0')}</span>
		</section>
		`
		// padStart formats number as fixed three-digit string by adding leading zeros when required, keeping the visual width of values consistent

	// scrollTop resets element's vertical scroll position to the top of container
	document.querySelector('#detail-scroll').scrollTop = 0


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
