/**
 * Config i18n
 * Tham khảo module i18n tại :
 * - Git : https://github.com/mashpie/i18n-node
 * - W3School : https://www.w3schools.com/tags/ref_language_codes.asp
 */
module.exports.config = {
    /**
     * Setup some locales - other locales default to en silently
     */
    locales:['vi', 'en'],
    /**
     * object or [obj1, obj2] to bind the i18n api and current locale to - defaults to null
     */
    register: global,
    /**
     * fall back from Dutch to German
     */
    fallbacks:{'vi': 'en'},
    /**
     * sets a custom cookie name to parse locale settings from - defaults to NULL
     */
    cookie: 'language',
    /**
     * you may alter a site wide default locale
     */
    defaultLocale: 'en',
    /**
     * query parameter to switch locale (ie. /home?lang=ch) - defaults to NULL
     */
    queryParameter: 'lang',
    /**
     * watch for changes in json files to reload locale on updates - defaults to false
     * whether to write new locale information to disk - defaults to true
     * sync locale information accros all files - defaults to false
     */
    autoReload: true,
    updateFiles: true,
    syncFiles: true,
    /**
     * where to store json files - defaults to './locales' relative to modules directory
     */
    directory: __dirname + '/languages',
    /**
     * hash to specify different aliases for i18n's internal methods to apply on the request/response objects (method -> alias).
     * note that this will *not* overwrite existing properties with the same name
     */
    api: {
      '__': '__',
      '__n': '__n'
    },
    /**
     * Downcase locale when passed on queryParam; e.g. lang=en-US becomes
     * en-us.  When set to false, the queryParam value will be used as passed;
     * e.g. lang=en-US remains en-US.
     */
    preserveLegacyCase: true
}