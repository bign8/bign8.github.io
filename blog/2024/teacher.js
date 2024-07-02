// TODO: don't run this on MOBILE
return

// create a div to hold the teacher components (source, canvas, logs)
let teacher = document.createElement('div')
teacher.style.position = 'fixed'
teacher.style.top = 0
teacher.style.right = 0
teacher.style.bottom = 0
teacher.style.width = 'calc(calc(100% - 200px)/2)'
document.body.append(teacher)

// shift over the main content
document.querySelector('main').style.width = teacher.style.width
document.querySelector('footer').style.width = teacher.style.width

// pull out all the content blocks and replace them with DIVs
let post = document.querySelector('.post')
let parts = post.querySelectorAll('.language-javascript')

parts.forEach(part => {
    let div = document.createElement('div')
    div.innerText = '---- removed block (TODO: space me) ----'
    part.replaceWith(div)

    teacher.appendChild(part) // TODO: toggle visability
})
