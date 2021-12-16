var gReportStaticId = '';
var gStoredReportPosition = '';
var gCurrentReportPosition = '';

function InfiniteReport(){}

InfiniteReport.init = function (reportStaticId) {
  if (reportStaticId == gReportStaticId) {
    return;
  }
  window.gReportStaticId = reportStaticId;
  reportStaticId = reportStaticId.substr(1);
  var infiniteReport = $('#report_'+reportStaticId+'_catch');
  if (infiniteReport.children('.i_infinite').html() == 'infinite') {
    $(window).scroll (function () {
      var infiniteReportNow = $('#report_'+reportStaticId+'_catch');
      if ($(this).scrollTop() > infiniteReportNow.offset().top-($(this).height()*1.5)) {
        if ((window.gStoredReportPosition != window.gCurrentReportPosition) || (window.gCurrentReportPosition == '')) {
          var $_clicker = $('#report_'+reportStaticId+'_catch td.pagination a.i_p_next_R'+reportStaticId);
          if ($_clicker.html() == null) {
            apex.jQuery("#report_" + reportStaticId + "_catch td.pagination .fielddata").html('');
          } else {
            //$_clicker.trigger('click');
          }
        }
      }
    })
  }
  return;
}

/* --------------------- APEX OVERLOAD FOR INFINITE REPORTS -------------------------------- */
function $a_report_Split(d, a, c) {
    var b = a.split("_");
    if ($('#report_'+d+'_catch').children('.i_infinite').html() == 'infinite') {
        $('#report_'+d+'_catch a.i_p_next_R'+d).remove();
        window.gStoredReportPosition = window.gCurrentReportPosition;
        $a_report_Infinite(d, b[0], b[1], b[2], null, null, c);
    } else {
      $a_report(d, b[0], b[1], b[2], null, null, c)
    }
}

function $a_report_Infinite(g, c, f, b, a, h, k) {
    var d = {
        p_flow_id: $v("pFlowId"),
        p_flow_step_id: $v("pFlowStepId"),
        p_instance: $v("pInstance")
    },
        e = "FLOW_PPR_OUTPUT_R" + g + "_";
    apex.jQuery("#report_" + g + "_catch").trigger("apexbeforerefresh", g);
    if (h) {
        if (h === "current") {
            d.p_request = e
        } else {
            if (h === "reset") {
                d.p_request = e + "reset_R_" + g
            }
        }
    } else {
        if ( !! a) {
            d.p_request = e + a;
            d.p_clear_cache = "RP";
            d.p_fsp_region_id = g
        } else {
            d.p_request = e + "pg_R_" + g;
            d.p_pg_max_rows = f;
            d.p_pg_min_row = c;
            d.p_pg_rows_fetched = b
        }
    }
    apex.jQuery(k).each(function () {
        var l;
        if (d.p_arg_names === undefined) {
            d.p_arg_names = [];
            d.p_arg_values = [];
            l = 0
        } else {
            l = d.p_arg_names.length
        }
        d.p_arg_names[l] = this.id;
        d.p_arg_values[l] = $v(this)
    });

    var $_stub_hold = apex.jQuery("#report_" + g + "_catch td.pagination");
    $_stub_hold.html('');
    var $_stub = Common.loader2 ($_stub_hold.last());
    apex.jQuery.ajax({
        mode: "abort",
        port: g,
        dataType: "html",
        type: "post",
        url: "wwv_flow.show",
        traditional: true,
        data: d,
        success: function (l) {
            var o = $u_js_temp_drop();
            apex.jQuery("#report_" + g + "_catch").attr("id", "report_" + g + "_catch_old");
            apex.jQuery(o).html(l);
            apex.jQuery("#report_" + g + "_catch_old td.pagination").remove();
            var co = apex.jQuery("#report_" + g + "_catch_old");
            co.after(apex.jQuery("#report_" + g + "_catch"));
            co.attr("id", "report_" + g + "_catch_obsolete");
            window.gCurrentReportPosition = Math.random();
            apex.jQuery(o).empty();
            apex.jQuery("#report_" + g + "_catch").trigger("apexafterrefresh", g);
            // Drop unnecessary report breaks
            var cob = apex.jQuery("#report_" + g + "_catch_obsolete .apex_report_break");
            var cnb = apex.jQuery("#report_" + g + "_catch .apex_report_break");
            cob.each(function () {
              ob = $(this).html();
              cnb.each(function () {
                if ($(this).html() == ob) {
                  $(this).remove();
                }
              });
            });
        }
    })
}

/* -------------------------------------------------------------------- */