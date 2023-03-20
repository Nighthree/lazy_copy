import { useState, useEffect, useRef, memo } from 'react';

type CopyType = {
  tag: string;
  desc: string;
  input: string;
  timeId: number;
  isEdit?: boolean;
};

const PlusBtn = memo((props: any) => {
  const { onClick, children } = props;
  const atClick = () => {
    onClick();
  };

  return (
    <button className="btn btn-sm btn-info" type="button" title="新增複製項目" onClick={atClick}>
      {children}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        className="bi bi-plus-lg"
        viewBox="0 0 16 16"
      >
        <path
          fill-rule="evenodd"
          d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"
        />
      </svg>
    </button>
  );
});

const CopyItem = (props: any) => {
  const { item, deleteItem, handleItem } = props;
  const [isSuccess, setIsSuccess] = useState(false);
  const inputDom = useRef<HTMLInputElement>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(inputDom.current?.value ?? '');
      setIsSuccess(true);
      console.log('複製成功');
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      console.error(error);
    }
  };


  const toggleEdit = () => {
    const newItem = { ...item };
    newItem.isEdit = !item.isEdit;
    handleItem(newItem);
  };

  const handleChange = (e: any) => {
    const name = e.target.name;
    const value = e.target.value;
    const newItem = { ...item };
    newItem[name] = value;
    handleItem(newItem);
  };

  return (
    <li className="copy-item">
      <div className="content-wrap">
        <div className="mb-3">
          {item.isEdit ? (
            <textarea
              className="form-control"
              rows={3}
              placeholder="請增加對此項目的描述"
              value={item.desc}
              name="desc"
              onChange={handleChange}
            ></textarea>
          ) : (
            <span className="text-secondary pre-line px-2">{item.desc}</span>
          )}
        </div>
        <div className="input-group">
          <input
            ref={inputDom}
            type="text"
            className="form-control"
            placeholder="請輸入您要複製的內容"
            name="input"
            value={item.input}
            disabled={!item.isEdit}
            onChange={handleChange}
          />
        </div>

        <div className="item-footer">
          <div className="tags px-2">
            {item.isEdit ? (
              <input
                type="text"
                name="tag"
                className="form-control"
                placeholder="增加此項目註記"
                value={item.tag}
                disabled={!item.isEdit}
                onChange={handleChange}
              />
            ) : (
              <small>{item.tag}</small>
            )}
          </div>
          <div className="success" data-active={isSuccess}>複製成功 !</div>
        </div>
      </div>
      <div className="btn-wrap">
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={toggleEdit}>
          {item.isEdit ? '儲存' : '編輯'}
        </button>
        {item.isEdit && (
          <button
            type="button"
            className="btn btn-sm btn-outline-danger mt-3"
            onClick={() => {
              deleteItem(item.timeId);
            }}
          >
            刪除
          </button>
        )}
        <button type="button" className="btn btn-sm btn-primary copy" onClick={copy}>
          複製
        </button>
      </div>
    </li>
  );
};

const CopyList = () => {
  const [list, setList] = useState<CopyType[]>([]);

  const addItem = () => {
    const newList = [...list];
    const newItem: CopyType = { tag: '', desc: '', input: '', timeId: new Date().getTime(), isEdit: true };
    newList.push(newItem);
    setList(newList);
  };

  const deleteItem = (timeId: number) => {
    const index = list.findIndex((item) => item.timeId === timeId);
    const newList = [...list];
    newList.splice(index, 1);
    setList(newList);
  };

  const handleItem = (item: CopyType) => {
    const index = list.findIndex((l) => l.timeId === item.timeId);
    const newList = [...list];
    newList[index] = item;
    setList(newList);
    if (!item.isEdit) setData(newList);
  };

  const getData = () => {
    try {
      const dataStr: string | null = localStorage.getItem('lazy_copy');
      if (dataStr) {
        const data = dataStr.split('&');
        const desc = data[0].split('=')?.[1].split(',');
        const input = data[1].split('=')?.[1].split(',');
        const timeId = data[2].split('=')?.[1].split(',');
        const tag = data[3].split('=')?.[1].split(',');

        const lan = desc?.length ?? 0;
        const array = [];
        for (let i = 0; i < lan; i++) {
          const obj: CopyType = {
            tag: tag[i],
            desc: desc[i],
            input: input[i],
            timeId: Number(timeId[i]),
            isEdit: false,
          };
          array.push(obj);
        }
        setList(array);
        console.log('get data', array);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const setData = (list: CopyType[]) => {
    let str = '';

    let desc = 'desc=';
    let input = 'input=';
    let timeId = 'timeId=';
    let tag = 'tag=';

    const last = list.length - 1;
    list.forEach((item, index) => {
      desc += item.desc;
      input += item.input;
      timeId += `${item.timeId}`;
      tag += item.tag;

      if (last > 0 && index !== last) {
        desc += ',';
        input += ',';
        timeId += ',';
        tag += ',';
      }
    });

    str = desc + '&' + input + '&' + timeId + '&' + tag;

    localStorage.setItem('lazy_copy', str);
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div>
      <div className="copy-tool">
        <PlusBtn onClick={addItem}></PlusBtn>
      </div>
      <ul className="copy-container">
        {list.map((item: CopyType) => (
          <CopyItem key={item.timeId} item={item} deleteItem={deleteItem} handleItem={handleItem} />
        ))}
      </ul>
    </div>
  );
};

export default CopyList;
