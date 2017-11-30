//表格提交/刷新
function XYTable(option){
	console.log(option);
	/*
	* 基于jquery做的,因为不想写兼容
	* 传入的自定义按钮部分必须是<a>标签才能触发table中的点击事件
	* 此功能并没有写兼容，望周知
	*
	* 写的比较垃圾，只是能实现了功能，没有测试过大量的数据，可以试试毒
	*
	* 传入数据结构
	* 其实就是将x轴y轴数据结合成一个json数据
	* {
		x轴:{
			y轴:value,
			y轴:value
		},
		x轴:{
			y轴:value,
			y轴:value
		}
	}
	*/
	//初始配置
	var _option = {
		element: $(this),//需要修改的table元素选择器
		datas:{},//传入的数据
		custom:{
			customName_X:'',
			customName_Y:'',
			customTd_X:'',//x轴最后一个格中要插入的按钮或者自定义单元格
			customTd_Y:''//y轴最后一个格中要插入的按钮或者自定义单元格
		},
		headTag:'',//表头（左上角第一个单元格）的内容
		loading:function(){},//loading函数,最好是loading开关函数，会在执行前后各调用一次
		callback_td:function(){},//td回调函数
		callback_init:function(){}//初始化table完成时回调函数
	}


	_option = Object.assign({},_option,option);

	//loading效果
	_option.loading();


//数据处理
	var datas = _option.datas;
	var _yAxis = [],//Array
		_xAxis = Object.keys(datas),//Array
		_rowDatas = {},//Object
		_xAxisLength = _xAxis.length,//Number
		_yAxisLength = 0;
	//抽出y轴
	for(var i=0;i<_xAxisLength;i++){
		var url = Object.keys(datas[_xAxis[i]]);
		if(url.length > _yAxisLength){
			_yAxisLength = url.length;
			_yAxis = url;
		}
	}
	//抽出多行x轴数据,以y轴为父类
	for(var i=0;i<_yAxisLength;i++){
		var y_value = _yAxis[i];
		_rowDatas[y_value] = [];
		for(var j of _xAxis){
			var row_value = datas[j][y_value]?  datas[j][y_value] : '<a>Null</a>';
			_rowDatas[y_value].push(row_value); 
		}
	}

//模板操作
	var _table = $(_option.element),
		_table_thead = $(table).find('thead'),
		_table_tbody = $(table).find('tbody');
	//存放thead、tbody的模板
	var _template_x = '',
		_template_y = '';
	//用于遍历的临时模板td、tr
	var _template_td = "<td numb='_td_numb_' style='_style_' type='_type_'>_value_</td>",
		_template_tr = "<tr numb='_tr_numb_'>_value_</tr>",
		_template_td_custom_x = _option.custom.customTd_X? _option.custom.customTd_X : "";
		_template_td_custom_y = _option.custom.customTd_Y? _option.custom.customTd_Y : "";
		// _template_td_query = "<td style='_style_'><a class='btn btn-xs btn-primary' type='_type_' numb='_name_'>汇总</a></td>",//默认的自定义按钮
		_template_tbody_row_custom = '',//body中最后一行的‘汇总’td模板
		_template_tbody_rows_td_datas = '',//tbody中显示数据td的模板
		_template_tbody_rows = {};//用于存放body中的tr行数据

	//模板生成
	for(var i = 0;i < _xAxisLength ;i++){
		var yAxis_name = _yAxis[i];
		_template_tbody_rows_td_datas += _template_td.replace('_value_','_value'+i)
														.replace('_type_','both')
														.replace('_style_','')
														.replace('_td_numb_',i+1);
		//如果存在自定义x轴，tbody的最后一行
		if(_option.custom.customName_X){
			_template_tbody_row_custom += _template_td.replace('_td_numb_',i+1)
														.replace('_type_','xAxis')
														.replace('_style_','')
														.replace('_value_',_template_td_custom_x);
		}
		//如果存在自定义x轴,tbody>tr>td:last-child节点的添加
		if(_option.custom.customName_X && i >= _xAxisLength-1){
			_template_tbody_rows_td_datas += _template_td.replace('_type_','yAxis')
															.replace('_td_numb_',i+2)
															.replace('_style_','')
															.replace('_value_',_template_td_custom_x);
			_template_tbody_row_custom += _template_td.replace('_td_numb_',i+2)
														.replace('_style_','')
														.replace('_value_','');
		}
	}



	//模板-数据  组合
			//模板组合- 填充y轴多列的数据
			for(var i = 0;i < _yAxisLength ;i++){
				var yAxis_name = _yAxis[i],
					template = _template_tbody_rows_td_datas;
				for(var j=0;j<_xAxisLength;j++){
					template = template.replace('_value'+j,(_rowDatas[yAxis_name][j]=='Null'? 'Null':"<a>" + _rowDatas[yAxis_name][j] + '</a>'));	
				}
				_template_tbody_rows[yAxis_name] = template;
			}

			//模板组合- 形成table的 X/Y轴框架
			//x轴(表头)
			for(var i=0;i< _xAxisLength;i++){
				var xAxis_name = _xAxis[i];
				if(i==0){
					_template_x += _template_td.replace('_value_',_option.headTag)
												.replace('_style_','')
												.replace('_td_numb',0)
												.replace('_type_','');
				}

                _template_x += _template_td.replace('_value_', '<strong>' + xAxis_name + '</strong>' )
                                               .replace('_td_numb_',i+1)
                                               .replace('_type_','thead-head')
                                               .replace('_style_','');
				//如果达到最大长度，添加到tr中
				if(i >= _xAxisLength-1){
                    _template_x += _template_td.replace('_value_',_option.custom.customName_X)
                    							.replace('_style_','')
                    							.replace('_type_','')
                    							.replace('_td_numb_',i+2);
                    _template_x = _template_tr.replace('_value_',_template_x)
               	   							  .replace('_tr_numb_',0);
                }
			}

			//y轴
			for(var i=0;i< _yAxisLength;i++){
				var yAxis_name = _yAxis[i];
				_template_y += _template_tr.replace('_value_',_template_td.replace('_value_','<strong>'+ yAxis_name + '</strong>' )
																			.replace('_td_numb_',0)
																			.replace('_style_','')
																			.replace('_type_','tbody-head')
											 					+ _template_tbody_rows[yAxis_name])
											.replace('_tr_numb_',i+1);
				if(i >= _yAxisLength-1 && _option.custom.customName_Y){
                	_template_y += _template_tr.replace('_value_',_template_td.replace('_value_',_option.custom.customName_Y) + _template_tbody_row_custom)   
                                                .replace('_tr_numb_',i+2);
                }
			}

		//dom操作
			$(_table_thead).html(" ");
			$(_table_tbody).html(" ");

			$(_table_thead).append(_template_x);
			$(_table_tbody).append(_template_y);
			//给所有的单元格添加点击事件
			$(_table).find('tbody a').on('click',function(e){

				var element = $(this)[0];
				var _type = $(this).parent('td').attr('type'),
					_xnumb = $(this).parent('td').attr('numb');
				var datas = {
						value:$(this).html(),
						tbody_head:'',
						thead_head:'',
						tbody_all:[],
						thead_all:[],
						x:$(this).parent('td').attr('numb'),
						y:$(this).parents('tr').attr('numb')
					},
					datas_more = '',
					datas_one = '';
				$(_table_thead).find('tr td:not(:first-child,:last-child) strong').each(function(){
					datas.thead_all.push($(this).html());
				})
				$(_table_tbody).find('tr td:first-child strong').each(function(){
					datas.tbody_all.push($(this).html());
				})

				//修改传值参数
				if(_type =='xAxis'){
					datas.thead_head = $(_table_thead).find('tr td[numb=' + _xnumb + '] strong').html();
				}else if(_type=='yAxis'){
					datas.tbody_head = $(this).parents('tr').find('td:eq(0) strong').html();
				}else if(_type=='both'){
					var xAxisData = $(_table_thead).find('tr td[numb=' + _xnumb + '] strong').html(),
						yAxisData = $(this).parents('tr').find('td:eq(0) strong').html();

					datas.tbody_head = xAxisData;
					datas.thead_head = yAxisData;
				}
				
				datas = Object.assign({},datas);
				console.log(datas);
				//点击callback
				if(_option.callback_td){
					_option.callback_td(element,datas);
				}

			})
		
			//如果有init回调函数的话，启用回调函数
			if(_option.callback_init){
				_option.callback_init();
			}
}

//添加为jquery插件
jQuery.fn.extend({
	XYTable:XYTable
})