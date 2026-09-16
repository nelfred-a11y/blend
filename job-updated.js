var query_offset = 0; //default when no cursor
var offset = query_offset;
var query_limit = 100 //default should be 100,used var for quick testing
var limit = query_limit;
var preload_job = false;
var allowed_visitor_filter_tags_array = ["Region", "Work Location", "Placement Type", "Location Requirement", "Management Level"];


var page_lang = document.documentElement.lang || "en";

var activated_filters = {};

allowed_visitor_filter_tags_array.forEach(el => {
    activated_filters[el] = [];
})

var experience_level_mapping = {
    Intern: "Entry Level",
    "All - Star": "Entry Level",
    "Associate Analyst": "Experienced",
    Analyst: "Experienced",
    "Senior Analyst": "Experienced",
    "Lead Analyst": "Experienced",
    Manager: "Experienced",
    "Senior Manager": "Experienced",
    "Associate Director": "Experienced",
    "Director Experienc": "Experienced",
    "Senior Director": "Experienced",
    VP: "Experienced",
    SVP: "Experienced",
    EVP: "Experienced",
    Consultant: "Experienced",
    "Consultant - Entry Level": "Entry Level",
    Director: "Experienced",
    "All-Star": "Entry level",
}

if (page_lang == "es") {
    experience_level_mapping = {
        Intern: "Nivel Inicial",
        "All - Star": "Nivel Inicial",
        "Associate Analyst": "Experimentado",
        Analyst: "Experimentado",
        "Senior Analyst": "Experimentado",
        "Lead Analyst": "Experimentado",
        Manager: "Experimentado",
        "Senior Manager": "Experimentado",
        "Associate Director": "Experimentado",
        "Director Experienc": "Experimentado",
        "Senior Director": "Experimentado",
        VP: "Experimentado",
        SVP: "Experimentado",
        EVP: "Experimentado",
        Consultant: "Experimentado",
        "Consultant - Entry Level": "Nivel Inicial",
        Director: "Experimentado",
        "All-Star": "Nivel Inicial",
    }
}

var employee_type_mapping = {
    'Consult to hire': 'Full time- Contract',
    'Consult to Hire': 'Full time- Contract',
    "Core": 'Full time- Permanent',
    "Consultant": 'Full time- Contract',
}

if (page_lang == "es") {
    employee_type_mapping = {
        'Consult to hire': 'Tiempo Completo- Contrato',
        'Consult to Hire': 'Tiempo Completo- Contrato',
        "Core": 'Tiempo Completo- Permanente',
        "Consultant": 'Tiempo Completo- Contrato',
    }
}


var userfacing_text_mapping = {
    "Region": "Region",
    "Work Location": "Location",
    "Capability": "Area of Expertise",
    "Placement Type": "Employee Type",
    "Location Requirement": "Location Type",
    "Management Level": "Experience Level",
    "Core": 'Full time- Permanent',
    "Consultant": 'Full time- Contract',
    "Intern": 'Intern',
    'Consult to hire': 'Full time- Contract',
    'Consult to Hire': 'Full time- Contract',
    'Associate Analyst': 'Associate Analyst',
    "Analyst": 'Analyst',
    'Senior Analyst': 'Senior Analyst',
    'Lead Analyst': 'Lead Analyst',
    'Americas': 'US',
    'United States': 'US',
    "Canada": "Canada",
    "IDC": "Asia Pacific",
    'Uruguay': 'LATAM',
};

if (page_lang == "es") {
    userfacing_text_mapping = {
        "Region": "Region",
        "Work Location": "Ubicacion",
        "Capability": "Area de Especializacion",
        "Placement Type": "Tipo De Contrato",
        "Location Requirement": "Modalidad",
        "Management Level": "Nivel de Experiencia",
        "Core": 'Tiempo Completo- Permanente',
        "Consultant": 'Tiempo Completo- Contrato',
        "Intern": 'Intern',
        'Consult to hire': 'Tiempo Completo- Contrato',
        'Consult to Hire': 'Tiempo Completo- Contrato',
        'Associate Analyst': 'Analista Asociado',
        "Analyst": 'Analista',
        'Senior Analyst': 'Analista Senior',
        'Lead Analyst': 'Analista Lider',
        'Americas': 'Americas',
        'United States': 'Estados Unidos',
        "Canada": "Canada",
        "IDC": "Asia Pacifico",
        'Uruguay': 'LATAM',
    }
}


var region_to_jump_to = null;
var experience_prefilter = null;

//putting functions to free space in body script as webflow has limit on characters there
function extractQueryParams() {
    var url = new URL(window.location.href);
    var params = url.searchParams;
    var queryParamsArray = Array.from(params.entries());
    var result = {};

    for (var i = 0; i < queryParamsArray.length; i++) {
        var key = queryParamsArray[i][0];
        var value = queryParamsArray[i][1];
        if (key == 'offset') query_offset = value;
        if (key == 'limit') query_limit = value;
        if (key == 'id') {
            preload_job = value; //only id
            $(".loading-overlay").fadeIn();
            open_single_job(preload_job);
        }
        if (key === "view") {
            region_to_jump_to = value.toLowerCase();
            $(".loading-overlay").fadeIn();
        }

        if (key === "experience") {
            experience_prefilter = value.toLocaleLowerCase();
            $(".loading-overlay").fadeIn();
        }

        if (key === 'continent' || key == "search" || key === 'job-title' || key === 'user_from') {
            if (value == 'Asia' || value == 'India') {
                window.location.replace("https://blend360.zohorecruit.in/jobs/Careers");
            }
            result[key] = value;
        }
    }
    //clean the url bar
    var currentUrl = window.location.href;
    var url = new URL(currentUrl);
    url.searchParams.delete('offset');
    url.searchParams.delete('limit');
    var newUrl = url.protocol + '//' + url.host + url.pathname;
    window.history.replaceState(null, null, newUrl);

    return result;
}


/* ------------------------------------------------------------------ */
/* DUMMY JOB DATA — kept in one place so it's easy to edit or remove.  */
/* ------------------------------------------------------------------ */

// Returns an array of dummy posting objects to prepend to the job list
// (same shape SmartRecruiters returns for each item in jobs.content).
function get_dummy_postings() {
    return [{
        "id": "700000000000001",
        "name": "Data Science Manager (Multiple vacancies)",
        "uuid": "fe4e0d60-38c3-42cd-8121-e1b2b06d910d",
        "jobAdId": "16b9ff5b-8882-477f-927a-5aba72a72cc0",
        "defaultJobAd": true,
        "refNumber": "REF2994K",
        "company": { "identifier": "Blend360", "name": "Blend360" },
        "releasedDate": "2026-09-14T22:00:54.758Z",
        "location": {
            "city": "Columbia",
            "region": "MD",
            "country": "us",
            "remote": true,
            "hybrid": false,
            "latitude": "39.2037144",
            "longitude": "-76.86104619999999",
            "fullLocation": "Columbia, MD, United States"
        },
        "industry": { "id": "marketing_and_advertising", "label": "Marketing And Advertising" },
        "department": {},
        "function": { "id": "business_development", "label": "Business Development" },
        "typeOfEmployment": { "id": "permanent", "label": "Full-time" },
        "experienceLevel": { "id": "mid_senior_level", "label": "Mid-Senior Level" },
        "customField": [
            { "fieldId": "65c5410215187e609d5ef598", "fieldLabel": "Function", "valueId": "3b73e969-e5d2-4c9d-9895-1119c082cae3", "valueLabel": "Data Science" },
            { "fieldId": "61439683f32966646e734c68", "fieldLabel": "Brands", "valueId": "default", "valueLabel": "Blend360" },
            { "fieldId": "COUNTRY", "fieldLabel": "Country/Region", "valueId": "us", "valueLabel": "United States" },
            { "fieldId": "6197c9d823c5e76f39c4645f", "fieldLabel": "Service Line", "valueId": "d936cdba-9715-41ed-9248-7bf65a82d96d", "valueLabel": "AI Engineering and Science (AIES)" },
            { "fieldId": "6197dcdf5c1dc670650a820b", "fieldLabel": "Work Location", "valueId": "665dc9c3-4baa-43e6-b0c6-36a3024ee063", "valueLabel": "Remote- US" },
            { "fieldId": "64d643779bd8c41fcb4ceaa3", "fieldLabel": "Placement Type", "valueId": "e83b1ed0-2929-4bc5-a2ce-6d7c46c5fa6c", "valueLabel": "Core" },
            { "fieldId": "65c540a028671f385bac4887", "fieldLabel": "Sub Service Line", "valueId": "c3d3d24b-5d75-4b27-aa16-cb8710be8449", "valueLabel": "Data Science" },
            { "fieldId": "62fbb0e7a3d83d3289d54fc7", "fieldLabel": "Job Priority", "valueId": "80122639-0dab-4974-82e3-a0bff4e3d3c4", "valueLabel": "B" },
            { "fieldId": "6197d79323c5e76f39c46463", "fieldLabel": "Region", "valueId": "757d06a5-0b5d-4861-b842-fe2bbb70ce73", "valueLabel": "NA" }
        ],
        "visibility": "PUBLIC",
        "ref": "#",
        "language": { "code": "en", "label": "English", "labelNative": "English (US)" }
    }];
}

// A quick lookup of which ids are dummy/manual jobs — used both to fetch
// their detail data and to decide special-case behavior (mailto apply, hide refer button).
var dummy_job_ids = ["744000149451709", "744000149449470", "700000000000001"];

function is_dummy_job(post_id) {
    return dummy_job_ids.includes(String(post_id));
}

// Returns the full job-detail object (same shape as the single-posting API
// response) for a dummy id, or null if post_id isn't one of ours.
function get_dummy_job_detail(post_id) {
    if (!is_dummy_job(post_id)) return null;

    return {
        "id": String(post_id),
        "name": "Data Science Manager (Multiple vacancies)",
        "active": true,
        "location": {
            "city": "Columbia",
            "region": "MD",
            "country": "us",
            "remote": true,
            "hybrid": false
        },
        "applyUrl": "#",
        "referralUrl": "#",
        "jobAd": {
            "sections": {
                "companyDescription": {
                    "title": "Company Description",
                    "text": "<p>Blend is a premier AI services provider, committed to co-creating meaningful impact for its clients through the power of data science, AI, technology, and people. With a mission to fuel bold visions, Blend tackles significant challenges by seamlessly aligning human expertise with artificial intelligence. The company is dedicated to unlocking value and fostering innovation for its clients by harnessing world-class people and data-driven strategy. We believe that the power of people and AI can have a meaningful impact on your world, creating more fulfilling work and projects for our people and clients. For more information, visit&#xa0;<a href=\"http://www.blend360.com/\" rel=\"noopener noreferrer\">www.blend360.com</a>.</p>"
                },
                "jobDescription": {
                    "title": "Job Description",
                    "text": "<p>Duties: Leads projects or workstreams that translate business problems into workable data science solutions, proposing different approaches and overseeing delivery of predictive analytics, models, and algorithms. Develops project plans, including milestones, dates, owners, risks, and contingency plans. Assembles and evaluates for applicability large, complex data sets from clients and external sources, managing the selection criteria and process for identifying the data and necessary data transformations that meet functional business requirements. Builds analytics tools to communicate actionable insights into customer acquisition, customer retention, margin improvement, operational efficiency, and other key business performance metrics. Performs data cleaning/hygiene and quality control, and integrates data from both client internal and external data sources on advanced data science platforms. Summarizes and describes data and data issues. Conducts statistical data analysis, including exploratory data analysis and data mining, and document key insights and findings toward decision-making. Trains, validates, and cross-validates predictive models and machine learning algorithms using state of the art data science techniques and tools. Documents predictive models/machine learning results that can be incorporated into client-deliverable documentation. Assists clients to deploy models and algorithms within their own architecture. Manages data analyst project work.</p><p>&#xa0;</p><p>Salary Range: $139,547-$160,000&#xa0;</p><p>Remote work permitted from any U.S. location. Domestic travel 10% of time to unanticipated client sites for meetings and project-related matters.</p><p>Apply to jobs@blend360.com w/ subject \u201cData Science Manager.\u201d</p><p>#BI-DNI</p>"
                },
                "qualifications": {
                    "title": "Qualifications",
                    "text": "<p>Requirements: Master\u2019s degree in Statistics, Mathematics, Computer Science, Data Science, Data Analytics, Business Analytics, or a related quantitative field. Two years of related work experience in advanced data science, to include two years of experience with each of the following predictive modeling and statistical analysis; advanced data science software languages and tools; query languages, semi-structured data, and relational databases, including query authoring and tuning; and cloud-based computing and storage platforms.</p>"
                },
                "additionalInformation": {
                    "title": "Additional Information",
                    "text": ""
                }
            }
        }
    };
}

/* ------------------------------------------------------------------ */


//cards template

var card_template = ({ job_title, type, location, level, link, tags, key }) => {
    const customFields = JSON.parse(tags).customFields;
    let tags_template = ""
    for (entry in customFields) {
        if (allowed_visitor_filter_tags_array.includes(entry)) {
            tags_template += `<div class="tag-entry" style="color: white; max-width:8rem; white-space:nowrap; overflow-x:hidden; text-overflow:ellipsis;">${userfacing_text_mapping[customFields[entry]] ?? customFields[entry]}</div>`
        }
    }
    return `
  <div class="job-post-single-card" id="${key}" data-job-tags='${tags}'>
    <div class="card-top">
      <h1 class="single-job-post-title">${job_title}</h1>
      <div class="job-description-caption"><p style="color: var(--black-bg); display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; height:calc(4.9rem - 1.1em); line-height:1.1rem; overflow:hidden; font-size:1rem;"></p></div>
    </div>
    <div style="color: var(--black-bg);">
        <!--h3 class="single-job-post-remote">${type}</h3-->
        <!--div class="tags-container" style="margin:10px 0px;">${tags_template}</div-->
        <div class="card-bottom">
        <h3 class="single-job-post-infos">${location}<br>${level}</h3>
        <figure role="link" data-href="/jobs?id=${key}" tabindex="0" class="job-see-details" onclick="open_single_job('${key}')" data-view-more-for='${link}'>
            <div class="card-cta-text">Details</div>
            <img src="https://assets-global.website-files.com/64c8fffb0e95cbc525815b79/64d21c3868ea7f843d8ff59b_results-arrow-up-right.svg" alt="Arrow" class="image-20">
        </figure>
        </div>
    </div>
    <div class="skeleton-loading">
      <div class="card-top">
        <div class="skeleton-loading-t skeleton-loading-box-text"></div>
        <div class="skeleton-loading-t skeleton-loading-box-text"></div>
      </div>
      <div>
        <div class="skeleton-loading-type skeleton-loading-box-text"></div>
        <br>
        <div class="card-bottom">
            <div class="skeleton-loading-location skeleton-loading-box-text"></div>
            <div class="skeleton-loading-cta skeleton-loading-box-text"></div>
        </div>
      </div>
    </div>
  </div>`
};


function toggle_drop_down(el) {
    if (window.innerWidth < 991) {
        const dpdwn = $(el).siblings(".filter-jobs-body-flex").eq(0);
        $(".filter-jobs-body-flex").not(dpdwn).hide();
        if (dpdwn.hasClass("hidden-div")) {
            dpdwn.fadeOut(function() {
                dpdwn.removeClass("hidden-div");
                dpdwn.fadeIn(100);
            })
        } else {
            dpdwn.fadeToggle(100);
        }
    }
}

function reset_filters_selection(also_reset_listing = true) {

    $("input[data-filter-tag-group]").prop("checked", false);
    $("#search-job").val("");
    if (also_reset_listing) {
        $("#reset-filters").attr("disabled", true);
        $("input[data-filter-tag-group]").last().trigger("change");
    }
    (function() {
        setTimeout(function() {
            $("#reset-filters").attr("disabled", false);
        }, 2000)
    })()
    return new Promise((resolve) => {
        setTimeout(function() {
            resolve(true);
        }, 100)
    })
}
var filter_checkbox_template = (label, groupName) => `
<label class="w-checkbox filter-checkbox">
    <input type="checkbox" onchange="filter_toggled(this)" name="${toCamelCaseNoSpace(label)}" data-filter-tag-group="${groupName}" data-filter-tag-for="${label}" class="w-checkbox-input filter-checkbox-field" autofilled="">
    <span class="filter-checkbox-label w-form-label" for="${toCamelCaseNoSpace(label)}">${userfacing_text_mapping[label] ?? label}</span>
</label>`

var filter_group_template = (name, fields) => `
<form class="filter-tags-field-block" name="${toCamelCaseNoSpace(name)}">
   <div class="filter-jobs-header-flex" onclick="toggle_drop_down(this)">
      <h3 class="filter-block-title">${userfacing_text_mapping[name] ?? name} <span class='all-notice'>(all)</span></h3>
      <div class="down-arrow-wrapper"><img src="https://assets-global.website-files.com/64c8fffb0e95cbc525815b79/65c29aecb253fa85192ebfec_arrow-down-3101.png" alt="" class="icon-dropdown"></div>
   </div>
   <div class="filter-jobs-body-flex hidden-div">${fields}</div>
</form>
`;

var formatTimestampToLongDate = (timestamp) => {
    const date = new Date(timestamp);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options);
    return formattedDate;
}

const job_board_regionNames = new Intl.DisplayNames(
    ['en'], { type: 'region' }
);

function getCountryFullName(short_name) {
    try {
        return job_board_regionNames.of(short_name.toUpperCase());
    } catch (e) {
        return short_name;
    }
}

function filter_jobs(input, from_loading = true, inverted = false) {
    let search = input.toLowerCase();
    if (search == "early career") {
        inverted = true;
        input = "senior";
    }

    const has_checked_checkboxes = $("input[data-filter-tag-group]:checked").length > 0 || false;
    if (input == "") {
        inverted = true;
    }

    $(".job-post-single-card").removeClass("shown_indicator");
    $('.job-post-single-card').attr('not-discared-by-filter', false);
    $(".empty-search-block").addClass("faded");
    $(".job-post-single-card").addClass("faded");
    setTimeout(function() {
        $(".empty-search-block").css("display", "none").removeClass("faded")
        $(".job-post-single-card").addClass("hidden").removeClass("faded")

        let results = miniSearch.search(input, { fuzzy: 0.2, prefix: true });
        if (!has_checked_checkboxes) {
            $('.job-post-single-card').attr('not-discared-by-filter', true);
        } else {
            $('.job-post-single-card').each(function() {
                let data_job_tags = $(this).data('job-tags').customFields || {};
                if (is_included_in_filtered_tags(activated_filters, data_job_tags)) {
                    $(this).attr('not-discared-by-filter', true);
                }
            })
        }
        var elementsToShow = $('.job-post-single-card[not-discared-by-filter="true"]').filter(function() {
            var elementId = this.id;
            return results.some(function(obj) {
                return obj.id === elementId;
            });
        });
        elementsToShow.addClass("shown_indicator");
        if (!inverted) {
            elementsToShow.removeClass("hidden");
            $('.number-of-jobs').text(elementsToShow.length);
        } else {
            let count = 0;
            $('.job-post-single-card[not-discared-by-filter="true"]').each(function() {
                if (!$(this).hasClass("shown_indicator")) {
                    $(this).removeClass("hidden");
                    count++;
                }
            })
            $('.number-of-jobs').text(count);
            if (count < 1) $(".empty-search-block").css("display", "flex");
        }

        (function() {
            if (window.innerWidth > 991 || window.should_scroll_to_job_grid) {
                window.should_scroll_to_job_grid = false;
                setTimeout(function() {
                    $('html, body').animate({
                        scrollTop: $(".job-list-cards-grid").offset().top - 120
                    }, 2000);
                }, 500)
            }
        })()

        $(".skeleton-loading").fadeOut();
        if (!inverted && elementsToShow.length < 1) $(".empty-search-block").css("display", "flex");
    }, 500);
}

function is_included_in_filtered_tags(activated_filters, data_job_tags) {
    const matches = Object.keys(activated_filters).map((group_name) => {
        if (activated_filters[group_name].length == 0) return true;
        return activated_filters[group_name].includes(data_job_tags[group_name])
    });
    return !matches.some(assertion => assertion === false);
}

function open_single_job(post_id) {
    let _url = new URL(window.location.href);
    let _current_url = _url.protocol + '//' + _url.host + _url.pathname;

    var api_link = `https://api.smartrecruiters.com/v1/companies/Blend360/postings/${post_id}`;
    var link = `${_current_url}?id=${post_id}`;
    window.history.replaceState(null, null, link);
    $(".loading-overlay").fadeIn();
    $(".single-jobpost").fadeOut();

    function render_job(result) {
        if (!result.active) {
            $(".job-info-flex").css("display", "none");
            $(".job-not-found-div").show();
            return;
        }
        let job_info = "";
        const sections = result.jobAd.sections;
        for (let info in sections) {
            if (sections.hasOwnProperty(info)) {
                job_info += `<h2 class="job-description-title">${sections[info]["title"]}</h2>`;
                if (info !== "videos")
                    job_info += `<p class="job-description-p">${sections[info]["text"]}</p>`;
                else job_info += `<p class="job-description-p"><a target="_blank" href='${sections[info]["urls"][0]}'>${sections[info]["urls"][0]}</a></p>`;
            }
        }

        $(".job-description-div").html(job_info);
        $("#job-title-h1-header").text(result.name);
        $("#job-location-text").html(`${result.location.city}, ${result.location.region}; <span style="text-transform:uppercase;">${result.location.country}</span> <br> ${result.location.remote ? "Remote" : "On-site"}`);

        if (is_dummy_job(post_id)) {
            $("#apply-button").attr('href', "mailto:jobs@blend360.com");
            $("#refer-button").css('display', 'none');
        } else {
            $("#apply-button").attr('href', result.applyUrl);
            $("#refer-button").attr('href', result.referralUrl);
        }

        const share_link = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}&amp;src=sdkpreparse`;
        $('.facebook-share').attr('href', share_link);
        $('.x-share').attr('href', `https://twitter.com/share?text=Job%20at%20Blend&url=${encodeURIComponent(link)}`)
        $('.linkedin-share').attr('href', `https://linkedin.com/shareArticle?url=${encodeURIComponent(link)}&title=Job%20at%20Blend`)

        $(".job-info-flex").css("display", "flex");
        $(".job-not-found-div").hide();
    }

    function finish_up() {
        $(".loading-overlay").fadeOut();
        $(".movable-content-wrapper").hide();
        $(".single-jobpost").fadeIn();
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth",
        });
    }

    // Serve dummy job detail without hitting the API at all
    const dummy_detail = get_dummy_job_detail(post_id);
    if (dummy_detail) {
        render_job(dummy_detail);
        finish_up();
        return;
    }

    $.get(api_link).done(function(result) {
        render_job(result);
    }).fail(function(e) {
        $(".job-info-flex").css("display", "none");
        $(".job-not-found-div").show();
    }).always(function() {
        finish_up();
    })
}

function addjobdescription(id) {
    (function(id) {
        setTimeout(function() {
            let cached_response = window.expiredStorage.getItem(id);
            if (cached_response && cached_response !== null) {
                cached_response = JSON.parse(cached_response);
                $txt = $(cached_response.jobAd.sections.jobDescription.text).text();
                $(`#${id} .job-description-caption p`).text($txt);
                return;
            }

            // Dummy jobs never come from the API, so pull straight from the dummy detail
            if (is_dummy_job(id)) {
                const dummy_detail = get_dummy_job_detail(id);
                if (dummy_detail) {
                    $txt = $(dummy_detail.jobAd.sections.jobDescription.text).text();
                    $(`#${id} .job-description-caption p`).text($txt);
                }
                return;
            }

            fetch(`https://api.smartrecruiters.com/v1/companies/Blend360/postings/${id}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    window.expiredStorage.setItem(id, JSON.stringify(data), 3600); //after 1hour
                    $txt = $(data.jobAd.sections.jobDescription.text).text();
                    $(`#${id} .job-description-caption p`).text($txt);
                })
                .catch(error => {
                    console.log(error)
                })
        }, 100);
    })(id)

}

function toCamelCaseNoSpace(inputString) {
    return inputString.replace(/\s+/g, '').replace(/(?:^\w|[A-Z]|\b\w)/g, function(match, index) {
        return index === 0 ? match.toLowerCase() : match.toUpperCase();
    });
}

let checkbox_debounce = false;

function update_filter_arrays_state(el) {
    const state = $(el).prop('checked')
    if (state && !activated_filters[$(el).data("filter-tag-group")].includes($(el).data("filter-tag-for"))) {
        activated_filters[$(el).data("filter-tag-group")].push($(el).data("filter-tag-for"))
    }
    const index = activated_filters[$(el).data("filter-tag-group")].indexOf($(el).data("filter-tag-for"))
    if (!state && index !== -1) {
        activated_filters[$(el).data("filter-tag-group")].splice(index, 1);
    }
    return true;
}

function filter_toggled(el) {
    if (checkbox_debounce) return;
    checkbox_debounce = true;
    $("input[data-filter-tag-for]").prop('disabled', true);
    const state = $(el).prop('checked')
    if (state && !activated_filters[$(el).data("filter-tag-group")].includes($(el).data("filter-tag-for"))) {
        activated_filters[$(el).data("filter-tag-group")].push($(el).data("filter-tag-for"))
    }
    const index = activated_filters[$(el).data("filter-tag-group")].indexOf($(el).data("filter-tag-for"))
    if (!state && index !== -1) {
        activated_filters[$(el).data("filter-tag-group")].splice(index, 1);
    }
    $("#start_search").trigger("click");
    setTimeout(function() {
        $("input[data-filter-tag-for]").prop('disabled', false);
        checkbox_debounce = false;
    }, 1000);
}

var countries_map = {
    ca: 'North America',
    in: 'Asia',
    nl: 'Europe',
    za: 'Africa',
    se: 'Europe',
    ch: 'Europe',
    ae: 'Asia',
    gb: 'Europe',
    us: 'North America'
};
var tags_database = {};

window.should_scroll_to_job_grid = false;


var search_database = [];
var query_params = extractQueryParams() || {};
var detected_search_query = Object.keys(query_params).length === 0 ? false : true;
let miniSearch = new MiniSearch({
    fields: ['name', 'type', 'typeOfE', 'city', 'country_short', 'country_full', 'continent', 'level', 'industry', 'department', 'job_function', ],
    storeFields: ['name']
})

function build_smart_recruiter_job_board(jobs) {
    if (jobs.totalFound > limit) {
        let current_cursor = jobs.offset;
        let max_offset = Math.ceil(jobs.totalFound / limit) - 1;
        let prev_cursor = current_cursor - 1;
        let next_cursor = current_cursor + 1;
        console.log({ current_cursor, max_offset, prev_cursor, next_cursor })
        const current_location = window.location.origin + window.location.pathname;
        if (prev_cursor >= 0) {
            $(".cursor-prev-button").css("display", "block");
            $(".cursor-prev-button").attr("href", `${current_location}?offset=${prev_cursor}&limit=${limit}`);
        }

        if (next_cursor <= max_offset) {
            const o = (jobs.totalFound - (next_cursor * limit)) % jobs.totalFound;
            const _limit = o < limit ? o : limit;
            $(".cursor-next-button").css("display", "block");
            $(".cursor-next-button").attr("href", `${current_location}?offset=${next_cursor}&limit=${_limit}`);
        }

        $(".cursor-buttons").css("display", "flex");
    }

    if (jobs.content) {
        const cards = [];
        let n_opening = 0;
        for (opening of jobs.content) {
            n_opening++;
            const obj = {}
            for (tag of opening.customField) {
                let vlabel = tag.valueLabel
                if (tag.fieldLabel == "Management Level")
                    vlabel = experience_level_mapping[tag.valueLabel] && tag.fieldLabel == "Management Level" ? experience_level_mapping[tag.valueLabel] : tag.valueLabel;
                if (tag.fieldLabel == "Placement Type") {
                    vlabel = employee_type_mapping[tag.valueLabel] && tag.fieldLabel == "Placement Type" ? employee_type_mapping[tag.valueLabel] : tag.valueLabel;
                }
                obj[tag.fieldLabel] = vlabel;
                if (!allowed_visitor_filter_tags_array.includes(tag.fieldLabel)) continue;
                if (!tags_database.hasOwnProperty(tag.fieldLabel)) {
                    tags_database[tag.fieldLabel] = [];
                }
                if (!(tags_database[tag.fieldLabel].includes(vlabel))) {
                    tags_database[tag.fieldLabel].push(vlabel);
                }
            }
            cards.push(card_template({
                key: opening.id,
                job_title: opening.name,
                type: `${opening.location.remote ? 'Remote' : 'Onsite'}, ${opening.typeOfEmployment.label}`,
                location: `${opening.location.city}, ${opening.location.country.toUpperCase()}`,
                level: opening.experienceLevel.label,
                link: opening.ref,
                tags: JSON.stringify({
                    knownFields: [
                        opening.name, opening.location.remote ? 'Remote' : 'Onsite',
                        opening.typeOfEmployment.label,
                        opening.location.city, opening.location.country,
                        getCountryFullName(opening.location.country),
                        opening.experienceLevel.label,
                        opening.industry.label,
                        opening.department.label,
                        opening.function.label,
                        formatTimestampToLongDate(opening.releasedDate),
                    ],
                    customFields: obj
                })
            }));
            search_database.push({
                id: opening.id,
                name: opening.name,
                type: opening.location.remote ? 'Remote' : 'Onsite',
                typeOfE: opening.typeOfEmployment.label,
                city: opening.location.city,
                country_short: opening.location.country,
                country_full: getCountryFullName(opening.location.country),
                continent: countries_map[opening.location.country],
                level: opening.experienceLevel.label,
                industry: opening.industry.label,
                department: opening.department.label,
                job_function: opening.function.label,
                timestamp: opening.releasedDate
            })
        }
        const tags_html = [];
        for (el in tags_database) {
            const checkbox = tags_database[el].map((input) => filter_checkbox_template(input, el));
            tags_html.push(filter_group_template(el, checkbox.join("")))
        }
        $(".filter-tags-form").empty();
        $(".loading-div-filters").fadeOut(function() {
            $(".filter-tags-form").html(tags_html.reverse().join("<br>"))
        })

        $('.number-of-jobs').text(n_opening);
        miniSearch.addAll(search_database);
        const n_exsting = $('.job-list-cards-grid').children().length
        let to_rem = 0;
        if (n_opening < 3) {
            to_rem = 3 - n_opening;
        }
        for (x of Array(to_rem).keys()) {
            $('.job-list-cards-grid').children().eq(x).remove();
        }

        if (detected_search_query) {
            $('html, body').animate({
                scrollTop: $(".job-list-cards-grid").offset().top - 280
            }, 2000);
        }
        const card_grid = $('.job-list-cards-grid');
        for (var i in cards) {
            (function(index, in_search_from_url = false) {
                setTimeout(function() {
                    const el = $(cards[index])
                    if (detected_search_query && index >= 3) {
                        el.addClass('hidden');
                    }

                    if (index < n_exsting) {
                        let outerHtml = el[0].outerHTML;
                        card_grid.children().eq(index).replaceWith(outerHtml);
                        addjobdescription($(outerHtml).attr("id"))
                    } else {
                        card_grid.append(el);
                        addjobdescription($(el).attr("id"));
                    }
                    setTimeout(function() {
                        if (!in_search_from_url) {
                            $('.skeleton-loading').eq(index).fadeOut();
                        } else if (index == (n_opening - 1)) {
                            if (query_params.search) {
                                filter_jobs(query_params.search, true);
                            } else {
                                filter_jobs(`${query_params["job-title"]} - ${query_params.user_from}, ${query_params.continent}`, true);
                            }
                        }

                        if (index == (n_opening - 1)) {
                            $(".open-role-card-cta").css({ "cursor": "pointer", "opacity": 1 }).attr("inactive", false);
                            $("#reset-filters").removeAttr("href").attr("onclick", 'reset_filters_selection()')
                            $("#open-america-jobs").removeAttr("href").click(function(event) {
                                event.preventDefault();
                                const currBtn = $(this);
                                currBtn.attr("inactive", true);
                                window.should_scroll_to_job_grid = true;
                                reset_filters_selection(false).then(function() {
                                    for (const k in activated_filters) {
                                        activated_filters[k] = [];
                                    }
                                    const el = $("form[name='region'] input[name='uSA']")
                                        .prop("checked", true).trigger("change")
                                        .parents(".filter-jobs-body-flex")
                                        .get(0);
                                    if (el) {
                                        setTimeout(function() {
                                            $(el).parents("form").get(0).scrollIntoView();
                                            currBtn.attr("inactive", false);
                                        }, 2000);
                                    } else {
                                        if (window.innerWidth > 991 || window.should_scroll_to_job_grid) {
                                            window.should_scroll_to_job_grid = false;
                                            setTimeout(function() {
                                                $('html, body').animate({
                                                    scrollTop: $(".job-list-cards-grid").offset().top - 120
                                                }, 2000);
                                                currBtn.attr("inactive", false);
                                            }, 500)
                                        }
                                    }
                                });
                            })

                            $("#open-latam-jobs").removeAttr("href").click(function(event) {
                                event.preventDefault();
                                const currBtn = $(this);
                                currBtn.attr("inactive", true);
                                window.should_scroll_to_job_grid = true;
                                reset_filters_selection(false).then(function() {
                                    for (const k in activated_filters) {
                                        activated_filters[k] = [];
                                    }
                                    const el = $("form[name='region'] input[name='uruguay']")
                                        .prop("checked", true).trigger("change")
                                        .parents(".filter-jobs-body-flex")
                                        .get(0);
                                    if (el) {
                                        setTimeout(function() {
                                            $(el).parents("form").get(0).scrollIntoView();
                                            currBtn.attr("inactive", false);
                                        }, 2000);
                                    } else {
                                        if (window.innerWidth > 991 || window.should_scroll_to_job_grid) {
                                            window.should_scroll_to_job_grid = false;
                                            setTimeout(function() {
                                                $('html, body').animate({
                                                    scrollTop: $(".job-list-cards-grid").offset().top - 120
                                                }, 2000);
                                                currBtn.attr("inactive", false);
                                            }, 500)
                                        }
                                    }
                                });
                            })

                            $("#open-emea-jobs").removeAttr("href").click(function(event) {
                                event.preventDefault();
                                const currBtn = $(this);
                                currBtn.attr("inactive", true);
                                window.should_scroll_to_job_grid = true;
                                reset_filters_selection(false).then(function() {
                                    for (const k in activated_filters) {
                                        activated_filters[k] = [];
                                    }
                                    const el = $("form[name='region'] input[name='eMEA']")
                                        .prop("checked", true).trigger("change")
                                        .parents(".filter-jobs-body-flex")
                                        .get(0);
                                    if (el) {
                                        setTimeout(function() {
                                            $(el).parents("form").get(0).scrollIntoView();
                                            currBtn.attr("inactive", false);
                                        }, 2000);
                                    } else {
                                        if (window.innerWidth > 991 || window.should_scroll_to_job_grid) {
                                            window.should_scroll_to_job_grid = false;
                                            setTimeout(function() {
                                                $('html, body').animate({
                                                    scrollTop: $(".job-list-cards-grid").offset().top - 120
                                                }, 2000);
                                                currBtn.attr("inactive", false);
                                            }, 500)
                                        }
                                    }
                                });
                            })

                            $("#open-asia-jobs").removeAttr("href").click(function(event) {
                                event.preventDefault();
                                const currBtn = $(this);
                                currBtn.attr("inactive", true);
                                window.should_scroll_to_job_grid = true;
                                reset_filters_selection(false).then(function() {
                                    for (const k in activated_filters) {
                                        activated_filters[k] = [];
                                    }
                                    const el = $("form[name='region'] input[name='india']")
                                        .prop("checked", true).trigger("change")
                                        .parents(".filter-jobs-body-flex")
                                        .get(0);
                                    if (el) {
                                        setTimeout(function() {
                                            $(el).parents("form").get(0).scrollIntoView();
                                            currBtn.attr("inactive", false);
                                        }, 2000);
                                    } else {
                                        if (window.innerWidth > 991 || window.should_scroll_to_job_grid) {
                                            window.should_scroll_to_job_grid = false;
                                            setTimeout(function() {
                                                $('html, body').animate({
                                                    scrollTop: $(".job-list-cards-grid").offset().top - 120
                                                }, 2000);
                                                currBtn.attr("inactive", false);
                                            }, 500)
                                        }
                                    }
                                });
                            })

                            if (region_to_jump_to) {
                                let region_buttons_map = {
                                    america: "#open-america-jobs",
                                    uruguay: "#open-latam-jobs",
                                    europe: "#open-emea-jobs",
                                    asia: "#open-asia-jobs"
                                }
                                $(region_buttons_map[region_to_jump_to]).trigger("click");
                                $(".loading-overlay").fadeOut();
                            }
                            if (experience_prefilter) {
                                if (experience_prefilter == "experienced") {
                                    window.should_scroll_to_job_grid = true;
                                    reset_filters_selection(false).then(function() {
                                        for (const k in activated_filters) {
                                            activated_filters[k] = [];
                                        }
                                        const el = $("form[name='managementLevel'] input[name='experienced']")
                                            .prop("checked", true).trigger("change")
                                            .parents(".filter-jobs-body-flex")
                                            .get(0);
                                        if (el) {
                                            setTimeout(function() {
                                                $(el).parents("form").get(0).scrollIntoView();
                                            }, 2000);
                                        } else {
                                            if (window.innerWidth > 991 || window.should_scroll_to_job_grid) {
                                                window.should_scroll_to_job_grid = false;
                                                setTimeout(function() {
                                                    $('html, body').animate({
                                                        scrollTop: $(".job-list-cards-grid").offset().top - 120
                                                    }, 2000);
                                                }, 500)
                                            }
                                        }
                                    });
                                    $(".loading-overlay").fadeOut();
                                } else if (experience_prefilter == "entry") {
                                    window.should_scroll_to_job_grid = true;
                                    reset_filters_selection(false).then(function() {
                                        for (const k in activated_filters) {
                                            activated_filters[k] = [];
                                        }
                                        const el = $("form[name='managementLevel'] input[name='entrylevel']")
                                            .prop("checked", true).trigger("change")
                                            .parents(".filter-jobs-body-flex")
                                            .get(0);
                                        if (el) {
                                            setTimeout(function() {
                                                $(el).parents("form").get(0).scrollIntoView();
                                            }, 2000);
                                        } else {
                                            if (window.innerWidth > 991 || window.should_scroll_to_job_grid) {
                                                window.should_scroll_to_job_grid = false;
                                                setTimeout(function() {
                                                    $('html, body').animate({
                                                        scrollTop: $(".job-list-cards-grid").offset().top - 120
                                                    }, 2000);
                                                }, 500)
                                            }
                                        }
                                    });
                                    $(".loading-overlay").fadeOut();
                                } else if (experience_prefilter == "contract") {
                                    window.should_scroll_to_job_grid = true;
                                    reset_filters_selection(false).then(function() {
                                        for (const k in activated_filters) {
                                            activated_filters[k] = [];
                                        }
                                        const el = $("form[name='placementType'] input[name='fulltime-Contract']")
                                            .prop("checked", true);
                                        const el2 = $("form[name='placementType'] input[name='directPlacement']")
                                            .prop("checked", false)

                                        if (el.get(0) || el2.get(0)) {
                                            let parent;
                                            if (el.get(0) && update_filter_arrays_state(el)) {
                                                if (!parent) {
                                                    el.trigger("change");
                                                    parent = el.parents(".filter-jobs-body-flex").get(0);
                                                }
                                            }
                                            if (el2.get(0) && update_filter_arrays_state(el2)) {
                                                if (!parent) {
                                                    el2.trigger("change");
                                                    parent = el2.parents(".filter-jobs-body-flex").get(0);
                                                }
                                            }
                                            setTimeout(function() {
                                                $(parent).parents("form").get(0).scrollIntoView();
                                            }, 2000);
                                        } else {
                                            if (window.innerWidth > 991 || window.should_scroll_to_job_grid) {
                                                window.should_scroll_to_job_grid = false;
                                                setTimeout(function() {
                                                    $('html, body').animate({
                                                        scrollTop: $(".job-list-cards-grid").offset().top - 120
                                                    }, 2000);
                                                }, 500)
                                            }
                                        }
                                    });
                                    $(".loading-overlay").fadeOut();
                                } else {
                                    setTimeout(function() {
                                        $('html, body').animate({
                                            scrollTop: $(".job-list-cards-grid").offset().top - 120
                                        }, 2000);
                                        $(".loading-overlay").fadeOut();
                                    }, 500)
                                }
                            }
                        }
                        if (index == (n_opening - 1) && preload_job != false) {
                        }
                    }, 10 + (2 * index));
                }, 10 + (2 * index));
            })(i, detected_search_query);
        }
    }
}

$(function() { //DOMContentLoaded instead of "load" to fasten the process
    const job_url = `https://api.smartrecruiters.com/v1/companies/Blend360/postings?offset=${query_offset}&limit=${query_limit}`;
    const key = encodeURIComponent(job_url);
    window.expiredStorage = new ExpiredStorage();
    let cached_response = window.expiredStorage.getItem(key);

    if (cached_response && cached_response !== null) {
        cached_response = JSON.parse(cached_response);
        cached_response.content.unshift(...get_dummy_postings()); // add dummy job(s) before the loop
        build_smart_recruiter_job_board(cached_response);
        return;
    }

    $.get(job_url).done(function(jobs) {
        window.expiredStorage.setItem(key, JSON.stringify(jobs), 3600); //after 1hour
        jobs.content.unshift(...get_dummy_postings()); // add dummy job(s) before the loop
        build_smart_recruiter_job_board(jobs);
    });
});


$(function() {
    $("#search-job").keydown(function(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            if (!$("#start_search").prop("disabled")) filter_jobs(event.target.value, false)
        }
    });

    $("#start_search").click(function(event) {
        $("#start_search").prop("disabled", true);
        event.preventDefault();
        event.stopPropagation();
        filter_jobs($("#search-job").val(), false);
        setTimeout(function() {
            $("#start_search").prop("disabled", false)
        }, 1000);
    })
});

$(function() {
    $(".single-job-post-close").click(function() {
        $(".single-jobpost").hide();
        $(".movable-content-wrapper").fadeIn(function() {
            $('html, body').animate({
                scrollTop: $(".job-list-cards-grid").offset().top - 280
            }, 2000);
        });
        let _url = new URL(window.location.href);
        let _current_url = _url.protocol + '//' + _url.host + _url.pathname;
        window.history.replaceState(null, null, _current_url);
    });

    $("body").click(function(event) {
        if (window.innerWidth < 991) {
            const el = $(event.target);
            if (el.parents(".filter-tags-field-block").length === 0 && !el.hasClass("filter-jobs-header-flex")) {
                $(".filter-jobs-body-flex").fadeOut(200);
            }
        }
    })
})
