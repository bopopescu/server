/symotion-prefixb* eslint-env browser*/
/* eslint no-use-before-define: ["error", { "functions": false }] */
/* global $, Handlebars*/
/* exported JsonForm */

Handlebars.registerHelper('ifEq', function (v1, v2, options) {
    if (v1 === v2) {
        return options.fn(this);
    }
    return options.inverse(this);
});

const templateEntry = Handlebars.compile($('#templateEntry').html(), { strict: true });
const templateContainer = Handlebars.compile($('#templateContainer').html(), { strict: true });
const templateNoElement = Handlebars.compile($('#templateNoElement').html(), { strict: true });

/**
 * Creates a program entry in a container.
 * @param {HTMLElement} container The container where the template is rendered into.
 * @param {String} type Specifies the type of the entry.
 * @param {Function} querySlaves A function which returns a Promise which queries a query set.
 * @param {Function} queryType A function which is called every time the choice changes.
 */
function addTypeEntry(container, type, querySlaves, queryType, context) {
    querySlaves().then(function (slaves) {
        $(container).find('.slave-no-elements').remove();
        let entryContainer = $(container).find('.script-' + type + '-content').first();

        if (slaves.length === 0) {
            let html = templateNoElement({ type });
            entryContainer.prepend(html);
        } else {

            let templateContext = {slaves: slaves, type: type};
            for (let attr in context) {
                if ({}.hasOwnProperty.call(context, attr)) {
                    templateContext[attr] = context[attr];
                }
            }

            // add html template element
            let html = templateEntry(templateContext);
            entryContainer.prepend(html);

            // get first element (-> prepend)
            let box = entryContainer.children().first();

            // set .onClick for the remove button
            box.find('.script-' + type + '-remove').on('click', function () {
                box.remove();
            });

            // set the update hook if the select changes
            box.find('.script-' + type + '-slave').on('change', function () {
                queryType($(this).find('option:selected').first().val()).then(
                    function (query) {
                        box.find('.script-' + type + '-' + type).each(function (idx, val) {
                            let target = $(val);
                            target.children().remove();
                            target.removeAttr('hidden');

                            let select_this = $(this).attr('data-selected');

                            $(query).each(function (idx, val) {
                                if (select_this === val) {
                                    target.append('<option selected> ' + val + ' </option>');
                                } else {
                                    target.append('<option> ' + val + ' </option>');
                                }
                            });
                        });
                    }
                );
            });

            box.find('.script-' + type + '-slave').trigger('change');

            entryContainer.find('[data-toggle="popover"]').popover({
                html: true,
                placement: 'left',
                trigger: 'hover'
            });
        }
    });
}

/**
 * JSON form class.
 */
const JsonForm = {
    /**
     * Initialises the container.
     * @param {HTMLElement} container A HTML container for the form.
     * @param {Objects} options An object of options.
     */
    init(container, options) {
        $(container).find('.script-program-add').on('click', function () {
            addTypeEntry(container, 'program', options.querySlavesPrograms, options.queryPrograms);
        });

        $(container).find('.script-filesystem-add').on('click', function () {
            addTypeEntry(container, 'filesystem', options.querySlavesFiles, options.queryFilesystems);
        });

        $(container).find('.script-program-hide').on('click', function () {
            let hideContainer = $(this).parent().next();
            if ($.trim($(hideContainer).html())) {
                hideContainer.toggle();
                $(this).prev().attr('disabled', function (_, attr) { return !attr; });
                $(this).children('i').toggleClass('mdi-chevron-up mdi-chevron-down');
            }
        });

        $(container).find('.script-filesystem-hide').on('click', function () {
            let hideContainer = $(this).parent().next();
            if ($.trim($(hideContainer).html())) {
                hideContainer.toggle();
                $(this).prev().attr('disabled', function (_, attr) { return !attr; });
                $(this).children('i').toggleClass('mdi-chevron-up mdi-chevron-down');
            }
        });
    },
    /**
     * Creates a form from a JSON object.
     * @param {HTMLElement} container A HTML container for the form.
     * @param {Objects} options An object of options.
     */
    loads(container, options, json) {
        $(container).append(templateContainer({ 'name': json.name }));

        this.init(container, options);

        json.programs.forEach(function (val) {
            addTypeEntry(container, 'program', options.querySlavesPrograms, options.queryPrograms, { 'currentSlave': val.slave, 'currentSelects': val.program, 'index': val.index });
        });

        json.filesystems.forEach(function (val) {
            addTypeEntry(container, 'filesystem', options.querySlavesFiles, options.queryFilesystems, { 'currentSlave': val.slave, 'currentSelects': val.filesystem, 'index': val.index });
        });
    },
    /**
     * Tries to get the current modification and returns it as an JSON object.
     * @param {HTMLElement} container A HTML container for the form.
     * @returns JSON Objects
     */
    dumps(container) {
        let json = new Object();

        json.name = $(container).find('.script-name').first().val();

        if (json.name === null) {
            return;
        }

        let dumpsArray = function (type) {
            let output = [];

            $(container).find('.script-' + type + '-content').first().find('.script-' + type + '-entry').each(function (idx, valRaw) {

                let entry = new Object();
                let val = $(valRaw);

                entry.index = Number(val.find('.script-' + type + '-index').first().val());
                entry[type] = val.find('.script-' + type + '-' + type).first().val();
                entry.slave = val.find('.script-' + type + '-slave').first().val();

                let error = false;

                if (entry.slave === '' || entry.slave === null) {
                    error = true;
                } else if (entry[type] === '' || entry[type] === null) {
                    error = true;
                }

                if (entry.index === null) {
                    error = true;
                }

                if (entry) {
                    output.forEach(function (element) {
                        if (element[type] === entry[type] && element.slave === entry.slave) {
                            error = true;
                        }
                    });
                }

                if (!error) {
                    output.push(entry);
                }
            });

            return output;
        };

        json.programs = dumpsArray('program');
        json.filesystems = dumpsArray('filesystem');

        return json;
    }
};
