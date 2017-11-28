//表格提交/刷新
function XYTable(option){
	//初始配置
	var _option = {
		element: 'table',//需要修改的table元素选择器
		datas:{},//传入的数据
		lastTd_X:'',//x轴最后一个格中要插入的按钮或者自定义单元格
		lastTd_Y:'',//y轴最后一个格中要插入的按钮或者自定义单元格
		loading:function(){},//loading函数,最好是loading开关函数，会在执行前后各调用一次
		callback:function(){}//回调函数
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
					var row_value = datas[j][y_value]?  datas[j][y_value] : 'Null';
					_rowDatas[y_value].push(row_value); 
				}
			}			
			
		//模板操作
			var _table = document.querySelector(_option.element),
				_table_thead = _table.querySelector('thead'),
				_table_tbody = _table.querySelector('tbody');
			//存放thead、tbody的模板
			var _template_x = '',
				_template_y = '';
			//用于遍历的临时模板td、tr
			var _template_td = "<td target-numb='_td_numb_' style='_style_'>_value_</td>",
				_template_tr = "<tr target-numb='_tr_numb_'>_value_</tr>",
				_template_td_query = "<td style='_style_'><a class='btn btn-xs btn-primary' type='_type_' numb='_name_'>汇总</a></td>",
				_template_tbody_td_null = '',//tbody中显示数据td的模板
				_template_tbody_td_query = '',//body中最后一行的‘汇总’td模板
				_template_tbody_trs = {};//用于存放body中的tr行数据
			//模板组合
			for(var i = 0;i <= _xAxisLength ;i++){
				var yAxis_name = _yAxis[i];
				if(i >= _xAxisLength){
					_template_tbody_td_null += _template_td_query.replace('_type_','yAxis')	
					_template_tbody_td_query += _template_td.replace('_value_','<strong>设备/URL</strong>');
				}else{
					_template_tbody_td_null += _template_td.replace('_value_','_value'+i)
										.replace('_td_numb_',i+1);
					_template_tbody_td_query += _template_td_query.replace('_type_','xAxis')
											.replace('_name_',i+1);
				}
			}
			//模板组合- 填充y轴多列的数据
			for(var i = 0;i < _yAxisLength ;i++){
				var yAxis_name = _yAxis[i],
					template = _template_tbody_td_null;
				for(var j=0;j<_xAxisLength;j++){
					template = template.replace('_value'+j,(_rowDatas[yAxis_name][j]=='Null'? 'Null':"<a type='both'>" + _rowDatas[yAxis_name][j] + '</a>'));	
				}
				_template_tbody_trs[yAxis_name] = template;
			}
			
			//模板组合- 形成table的 X/Y轴框架
			//x轴(表头)
			for(var i=0;i< _xAxisLength;i++){
				var xAxis_name = _xAxis[i];
				if(i==0){
					_template_x += _template_td.replace('_value_','<strong>设备/URL</strong>') 
                                                        + _template_td.replace('_value_', '<strong>' + xAxis_name + '</strong>' )
                                                                        .replace('_td_numb_',i+1);	
				}else{
					_template_x += _template_td.replace('_value_', '<strong>'+ xAxis_name +'</strong>')
                                                                        .replace('_td_numb_',i+1);		
				}
				//如果达到最大长度，添加到tr中
				if(i >= _xAxisLength-1){
                                        _template_x += _template_td.replace('_value_','<strong>URL汇总</strong>').replace('_td_numb_',i+2)
                                                                        .replace('_td_numb_',i+1);
                                        _template_x = _template_tr.replace('_value_',_template_x);
                                }
			}
			//y轴
			for(var i=0;i< _yAxisLength;i++){
				var yAxis_name = _yAxis[i];
				if(i==0){
					_template_y += _template_tr.replace('_value_',_template_td.replace('_value_','<strong>'+ yAxis_name + '</strong>' ) + _template_tbody_trs[yAxis_name])
                                                                        .replace('_tr_numb_',i+1)
				}else{
					_template_y += _template_tr.replace('_value_',_template_td.replace('_value_', '<strong>'+ yAxis_name + '</strong>' ) + _template_tbody_trs[yAxis_name])
                                                                        .replace('_tr_numb_',i+1);	
				}
				if(i >= _yAxisLength-1){
                                        _template_y += _template_tr.replace('_value_',_template_td.replace('_value_','<strong>设备汇总</strong>') + _template_tbody_td_query)   
                                                                        .replace('_tr_numb_',i+2);
                                }
			}
		//dom操作
			$(_table_thead).html(" ");
			$(_table_tbody).html(" ");

			$(_table_thead).append(_template_x);
			$(_table_tbody).append(_template_y);
			$(_table).find('tbody a').on('click',function(e){

				var _type = $(this).attr('type'),
					_xnumb = $(this).attr('numb');
				var datas = {
						device:'',
						url:'',
						l_device:'',
						l_url:''
					},
					datas_more = '',
					datas_one = '';
				//修改传值参数
				if(_type =='xAxis'){
					var temp_datas = '';
					$(_table_tbody).find('tr:not(:last-child)').each(function(){
						//datas_more.push($(this).find('td:eq(0)').html());
						datas_more += ',' + "'" + $(this).find('td:eq(0) strong').html() +"'";
					});
					datas_one = $(_table_thead).find('tr td[target-numb=' + _xnumb + '] strong').html();
					
					datas.device = datas_one;
					datas.l_url = '(' + datas_more.slice(1) + ')'; 
				}else if(_type=='yAxis'){
					$(_table_thead).find('tr td:not(:last-child,:first-child)').each(function(){
                                               // datas_more.push($(this).html());
						datas_more += ',' + "'" + $(this).find('strong').html() + "'";
                                        });
					datas_one = $(this).parents('tr').find('td:eq(0) strong').html();

					datas.url = datas_one;
                                        datas.l_device = '(' + datas_more.slice(1) + ')';
				}else if(_type=='both'){
					var _xnumb = $(this).parent('td').attr('target-numb');
					var xAxisData = $(_table_thead).find('tr td[target-numb=' + _xnumb + '] strong').html(),
						yAxisData = $(this).parents('tr').find('td:eq(0) strong').html();

					datas.device = xAxisData;
					datas.url = yAxisData;
				}
				
				datas = Object.assign({},FORM_DATA,datas);

				//点击callback

			})
		
			//如果有回调函数的话，启用回调函数
			if(_option.callback){
				_option.callback();
			}
}