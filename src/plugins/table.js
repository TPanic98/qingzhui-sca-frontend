import 'bootstrap-table/dist/bootstrap-table.min.css';

import './jquery.js';
import $ from 'jquery';
import Vue from 'vue';
import 'bootstrap';
import 'jquery-treegrid/js/jquery.treegrid.min.js';
import 'bootstrap-table/dist/bootstrap-table.js';
import 'bootstrap-table/dist/locale/bootstrap-table-zh-CN.min.js';
import 'bootstrap-table/dist/locale/bootstrap-table-zh-TW.min.js';
import 'bootstrap-table/dist/extensions/treegrid/bootstrap-table-treegrid.min.js';
import 'bootstrap-table/dist/extensions/defer-url/bootstrap-table-defer-url.js';
import BootstrapTable from 'bootstrap-table/dist/bootstrap-table-vue.esm.js';
import { handleTableLoadError } from '@/shared/utils';
import xssFilters from 'xss-filters';

$.fn.bootstrapTable.defaults.onLoadError = function (_status, jqXHR) {
  handleTableLoadError(jqXHR && jqXHR.responseJSON);
};

function boundedSummary(formatShowingRows) {
  return function (pageFrom, pageTo, totalRows, totalNotFiltered) {
    // NB: `this` is the table's options object. applyTotalCountHeaders sets
    // `boundedTotal` there. It stays unset for every table whose endpoint
    // does not send X-Total-Count-Type.
    let shown = totalRows;
    if (this.boundedTotal) {
      shown = `${this.boundedTotal}+`;
      if (this.boundedTotalTitle) {
        const title = xssFilters.inDoubleQuotedAttr(this.boundedTotalTitle);
        shown = `<span title="${title}">${shown}</span>`;
      }
    }
    return formatShowingRows.call(
      this,
      pageFrom,
      pageTo,
      shown,
      totalNotFiltered,
    );
  };
}

// initLocale replaces formatters from the selected locale, so decorate each
// locale as well as the defaults to retain the API's lower-bound count marker.
$.fn.bootstrapTable.defaults.formatShowingRows = boundedSummary(
  $.fn.bootstrapTable.defaults.formatShowingRows,
);
for (const locale of new Set(Object.values($.fn.bootstrapTable.locales))) {
  if (locale.formatShowingRows) {
    locale.formatShowingRows = boundedSummary(locale.formatShowingRows);
  }
}

Vue.component('BootstrapTable', BootstrapTable);
