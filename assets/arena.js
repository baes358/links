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


// Attribution to LLM (ChatGPT): I was trying to figure out a sorting/categorization method to help structure this as a mapping function for the different media types. And so, ChatGPT suggested I create a helper function to get the actual "kind" or type of media block -> to be used in other main functions
// My understanding: getKind function matches types of the block and returns a short label accordingly that will be used for titles and filtering.
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

	// checks for these properties and prefers large quality pictures for thumbnails
	if (blockData.image && blockData.image.large && blockData.image.large.src_2x){
		return blockData.image.large.src_2x
	}

	// fallback to original image source if large size isn’t available
	if (blockData.image && blockData.image.original && blockData.image.original.url){
		return blockData.image.original.url
	}

	// when no image is found return empty
	return ''
}


// Inspired by the getImageUrl() function, I created getSourceUrl() to return the best URL when user later clicks to "equip" the block -> directs to external link
// first tries the source url, then attachment file, then the actual Are.na block page as a fallback
let getSourceUrl = (blockData) => {
	if (blockData.source && blockData.source.url){
		return blockData.source.url
	}
	if (blockData.attachment && blockData.attachment.url){
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

	// I added the hudTitle and siTotal to add as extra elements 
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






// Attribution to LLM (ChatGPT): It suggested formatting the scanned counter with padStart() so the number would always appear as three digits (like 001, 002, etc.), keeping the UI count visually consistent no matter how many blocks were scanned

// My understanding: updateScanned() converts the scanned number into a string, pads it to three digits with leading zeros using padStart(), and updates the text content of both #h-scan and #si-scanned in the DOM so the interface reflects how many unique blocks the user has viewed so far
let updateScanned = () => {
	let display = scanned.toString().padStart(3, '0')

	document.querySelector('#h-scan').textContent = display
	document.querySelector('#si-scanned').textContent = display

}




// Attribution to LLM (ChatGPT): It suggested using a toast notification pattern using setTimeout and clearTimeout to manage the timing and prevent overlapping animations

// My understanding: showToast() selects the #toast element, sets its message text, and then adds the "show" class to trigger a visible state. clearTimeout(toast._timer) ensures any previously running timeout is canceled so that multiple rapid calls to the notification don’t stack or glitch. Then setTimeout() starts a new 2200ms (2.2 seconds) timer that removes the "show" class, which hides the toast after the duration

let showToast = (msg) => {
	let toast = document.querySelector('#toast')

	toast.textContent = msg
	toast.classList.add('show')

	clearTimeout(toast._timer)
	toast._timer = setTimeout(() => toast.classList.remove('show'), 2200)
}




// Then our big function for specific-block-type rendering:

// Attribution to LLM (ChatGPT): It suggested structuring each block as a thumbnail and storing the block data in a lookup object (blocksById) so that the grid is "inspectable" like an actual game inventory, and users can access full details of a block through click event handlers.

// My understanding: renderBlock() selects the shared #channel-blocks container and generates a thumbnail-based list item for each block. It determines the block’s kind, saves the full block data in blocksById for later reference, and uses getImageUrl() to decide whether to render an image thumbnail or a placeholder with text (depending on what is available through Are.na API). The function then inserts the <li> into the HTML DOM, attaching data attributes (data-block-id and data-kind) to support click event handlers and filtering logic
let renderBlock = (blockData) => {
	// To start, a shared ul where we’ll insert all our blocks 
	let channelBlocks = document.querySelector('#channel-blocks') 
	let kind = getKind(blockData)
	// store blocks by their id so can look it up later
	blocksById[blockData.id] = blockData 
	// want to only show thumbnail media initially 
	

	let imageUrl = getImageUrl(blockData)
	let thumbnail = '' 
	let thumbItem = '' 
	

	// block has thumbnail image
	if (imageUrl){ 
		thumbnail = 
		`
		<img src="${imageUrl}" alt="">
		`
	} else {
		thumbnail = 
		`
			<section class="thumb-placeholder">
				<p>${blockData.title || blockData.type}</p>
			</section>
		`
	}
	
	
	
	// use data-block-id to access block
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




// Attribution to LLM (Claude AI): It suggested structuring the detail panel as a "state-driven UI" that conditionally renders metadata, media previews, and formatted stats based on the block’s type.

// My understanding: showDetail() switches the right panel from its default state (which is initially showing the channel info) to a detailed view when a specific block is selected by the user. It determines the block’s type, the created date, descriptions, and media previews depending on whether the block contains an image, video, audio file, or embed. Then, the function inserts the structured content into the DOM, formats the index with padStart() for visual consistency, and resets the scroll position so each newly selected block starts at top of detail panel
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




// Attribution to LLM (Claude AI): It suggested a reset function to clear the detail panel on right so that the channel info (initial state) populates again
// My understanding: resetDetail() restores the right panel to its default state by removing the active highlight from any selected block, hiding the detail panel, showing the original info panel, resetting the header label to “DETAILS,” and clearing the stored reference to the previously selected block
let resetDetail = () => {
	// removes selected highlight from whichever block was active for details panel
	document.querySelectorAll('.content.selected').forEach(block => block.classList.remove('selected'))

	// need to swap panels bakc to its initial state
	document.querySelector('#state-detail').classList.remove('show')
	document.querySelector('#state-info').classList.remove('gone')
	document.querySelector('#detail-header-label').textContent = 'DETAILS'

	selectedBlock = null


}





// Attribution to LLM (ChatGPT): It suggested using aria-pressed for toggle state management and the [hidden] attribute to efficiently control element visibility without manually adding/removing CSS classes.

// My understanding: applyFilters() reads the current state of each .filter-toggle button by checking its aria-pressed value and builds an object that maps each media kind (IMG, TXT, MP3, etc.) to true or false. It then loops through all rendered block elements, compares their data-kind attribute to the active map, and sets their hidden property accordingly. This separates UI state (toggle buttons) from rendering logic (block visibility) while keeping the filtering system declarative.
let applyFilters = () => {
	// what kinds of data are currently on
	// maps like { IMG: true, MP3: false, ... }
	let actives = {}

	
	let toggle = document.querySelectorAll('.filter-toggle')

	toggle.forEach((button) => {
		// what category this toggle controls
		let kind = button.getAttribute('data-kind')
		// this is the current state
		let on = button.getAttribute('aria-pressed') === 'true'
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

// Attribution to LLM (ChatGPT): It suggested centralizing toggle behavior by attaching click event listeners once and triggering a shared filtering function (applyFilters) whenever a toggle’s state changes.

// My understanding: setFilters() selects all .filter-toggle buttons and attaches a click listener to each one. When clicked, the function reads the current aria-pressed value, toggles it between 'true' and 'false', and then calls applyFilters() to update which blocks are visible to user. Running applyFilters() once at the end makes sure that the interface works in the correct filtered state when the page first loads
let setFilters = () => {
	let toggle = document.querySelectorAll('.filter-toggle')

	toggle.forEach((button) => {
		button.addEventListener('click', () => {
			let current = button.getAttribute('aria-pressed') === 'true'
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

	// Attribution to LLM (Claude AI): It suggested using the filtering logic immediately after rendering blocks so that the UI state and navigation reflect the current dataset from the API

	// My understanding: setFilters() is called once the blocks are rendered to ensure the toggle system is active and the interface reflects the correct visible state. 
	setFilters()

	// The nav element is selected from the DOM. If it exists, a custom data attribute (data-count) is set to the total number of items returned from the Are.na API (json.data.length). 
	// This allows the count to be accessed in CSS (via attr()) or JavaScript for display, filtering, or interface feedback.A
	let nav = document.querySelector('nav')

	// This pattern separates data from presentation by storing state in a semantic data attribute rather than hardcoding values.
	if (nav) nav.setAttribute('data-count', json.data.length)






	// Attribution to LLM (ChatGPT): It suggested using event delegation on #channel-blocks to handle clicks for dynamically generated <li> elements instead of having to manually attach individual listeners to each block.

	// My understanding: A single click listener is attached to the parent #channel-blocks container. When a user clicks anywhere inside it, event.target.closest('li[data-block-id]') should identify the relevant block item, even if the click occurred on a nested element like an <img>. The code then retrieves the stored block data, updates the selected state visually AND logically, calculates the block’s index in the grid, and increments the scanned counter only if that block hasn’t been viewed before (tracked using a Set). Finally, showDetail() renders the selected block’s detailed view.
	let channelBlocks = document.querySelector('#channel-blocks')
	let scannedBlocks = new Set()

	// to open the blocks with click
	// to find the clicked <li> element with the data block id, even if you click the img inside

	channelBlocks.addEventListener('click', (event) => {


	
		// clicking on any thumbnail finds its nearest li[data-block-id], then opens that block in the modal.
		let clicked = event.target.closest('li[data-block-id]')
		if (!clicked) return

		// look up + search for the saved block data
		let blockData = blocksById[clicked.getAttribute('data-block-id')]
		if (!blockData) return


		// highlight the clicked block, and remove highlight from the previous
		document.querySelectorAll('.content.selected').forEach(block => block.classList.remove('selected'))
		clicked.classList.add('selected')

		// to store as selected for the action buttons to reference on user's end
		selectedBlock = { 
			blockData, 
			cell: clicked 
		}

		// finds the position of this block in the existing inventory grid
		let allBlocks = Array.from(channelBlocks.querySelectorAll('li[data-block-id]'))
		let index = allBlocks.indexOf(clicked)


		// Attribution to LLM (ChatGPT): It suggested using a Set, not an Array, to track which block IDs have already been viewed so the scanned counter only increments once per unique block.

		// My understanding: Before increasing the scanned counter, the code checks whether the current block’s ID already exists inside the scannedBlocks Set. If it does not, the ID is added to the Set, scanned is incremented, and updateScanned() refreshes the UI. A Set is more appropriate than an array here because it automatically enforces uniqueness of the block and allows for efficient lookup with .has(), avoiding duplicate entries and unnecessary iteration checks. And to my understanding, arrays are not as efficient because .includes() has to loop through the entire array to check if the value exists
		let blockId = blockData.id

		if (!scannedBlocks.has(blockId)){
			scannedBlocks.add(blockId)
			scanned++
			updateScanned()
		}
		

		showDetail(blockData, index)
	})


	// Attribution to LLM (ChatGPT): It helped me to structure the action buttons (EQUIP + DROP) with defensive guard clauses.

	// My understanding: The equip button checks whether a block is currently selected and, if it is, it opens its original source URL in a new tab using window.open() with the 'noopener' security parameter. It then triggers a toast notification for interface feedback so that the user is notified. 

	// adding event logic for clicking on equip button -> directs user to original link
	let equipBtn = document.querySelector('#btn-equip')
	equipBtn.addEventListener('click', () => {
		if (!selectedBlock) return
		window.open(getSourceUrl(selectedBlock.blockData), '_blank', 'noopener')
		showToast('OPENING IN NEW TAB ↗')
	})

	// My understanding: The drop button similarly guards against null selection, applies a short opacity transition for visual feedback, hides the block after 300ms, resets the detail panel to its default state, and shows a confirmation toast notification. Both interactions rely on the shared selectedBlock state to make sure that the actions apply only to the actively selected block

	// adding event logic for clicking on drop button -> hides to show initial state of right panel
	let dropBtn = document.querySelector('#btn-drop')
	dropBtn.addEventListener('click', () => {
		if (!selectedBlock) return

		selectedBlock.cell.style.transition = 'opacity .3s ease'
		selectedBlock.cell.style.opacity = '0'
		setTimeout(() => {
			selectedBlock.cell.hidden = true
			resetDetail()
		}, 300)

		showToast('REMOVED FROM VIEW ✕')
	})

})

let hero = document.querySelector('#hero')
let flash = document.querySelector('#hero-flash')

// Attribution to LLM (Claude AI): It suggested using setTimeout calls to choreograph the hero screen transition animation and the keydown event listener with the { once: true } option so that the interaction only triggers once

// My understanding: enterInventory() adds a temporary flash effect, then removes it after 80ms while adding a “leaving” class to animate the hero screen out. A second setTimeout then hides the hero element after the animation completes
let enterInventory = () => {
	flash.classList.add('on')
	setTimeout(() => {
		flash.classList.remove('on')
		hero.classList.add('leaving')

	}, 80)
	setTimeout(() => {
		hero.style.display = 'none'
	}, 1000)
}



// My understanding: The click listener allows mouse interaction, while the keydown listener enables keyboard entry. Using { once: true } makes sure that the keydown event only fires one time, which prevents repeated triggers or animation glitches if the user presses multiple keys

// event listeners for when user is at hero screen and wants to enter inventory by clicking or using any key
hero.addEventListener('click', enterInventory)

window.addEventListener('keydown', () => {
	if (!hero.classList.contains('leaving')) enterInventory()
},
	// event listener fires only once
	{ once: true }
)



// adding mobile drawer for better mobile usability
let drawer = document.querySelector('#panel-detail')
let drawerHandle = drawer.querySelector('.p-header')

let openDrawer = () => {
	drawer.classList.add('open')
}

let closeDrawer = () => {
	drawer.classList.remove('open')
	// bring back initial state of channel info
	resetDetail()
}

drawerHandle.addEventListener('click', () => {
	if (drawer.classList.contains('open')){
		closeDrawer()
	} else{
		openDrawer()
	}
})