import { h } from 'vue';

export function useResizableTable() {
  // 可调整列宽表格组件
  const ResizeableHeader = (props: any) => {
    let dragging = false;
    let startX = 0;
    let startWidth = 0;
    let column: any = null;
    let table: HTMLElement | null = null;

    const handleMousedown = (e: MouseEvent, col: any) => {
      dragging = true;
      startX = e.clientX;
      column = col;
      startWidth = parseInt(col.width || col.minWidth || 80);

      // 查找表格DOM元素
      let currentEle = e.target as HTMLElement;
      while (currentEle && currentEle.tagName !== 'TABLE') {
        currentEle = currentEle.parentElement as HTMLElement;
      }
      table = currentEle;
      
      // 添加全局事件监听
      document.addEventListener('mousemove', handleMousemove);
      document.addEventListener('mouseup', handleMouseup);
      
      // 阻止默认行为和事件冒泡
      e.stopPropagation();
      e.preventDefault();
    };

    const handleMousemove = (e: MouseEvent) => {
      if (!dragging) return;
      // 计算宽度变化
      const offset = e.clientX - startX;
      const newWidth = Math.max(startWidth + offset, 50);
      
      if (column) {
        column.width = newWidth;
        
        if (table) {
          // 更新表格宽度
          const tableWidth = parseInt(table.style.width || '0');
          if (tableWidth) {
            table.style.width = `${tableWidth + offset}px`;
          }
        }
      }
    };

    const handleMouseup = () => {
      dragging = false;
      document.removeEventListener('mousemove', handleMousemove);
      document.removeEventListener('mouseup', handleMouseup);
    };

    // 创建拖拽把手
    const renderResizeHandle = (col: any) => {
      if (!col) return null;
      if (col.resizable !== false) {
        return h('span', {
          class: 'resize-handle',
          onClick: (e: MouseEvent) => { e.stopPropagation(); },
          onMousedown: (e: MouseEvent) => { handleMousedown(e, col); }
        });
      }
      return null;
    };

    // 渲染表头
    const { column: col } = props; // 将解构的 column 重命名为 col
    const resizeHandle = renderResizeHandle(col);
    
    return h('th', {
      ...props,
      class: `${props.class || ''} resizable-column`,
    }, [
      h('div', { class: 'ant-table-header-content' }, props.children),
      resizeHandle
    ]);
  };

  // 注册可调整列宽组件
  const resizableComponents = {
    header: {
      cell: ResizeableHeader
    }
  };

  return {
    resizableComponents
  };
}